"""Export the chemistry workflow figures using the released native connector."""
import argparse
import csv
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

PUBLISH = Path(__file__).resolve().parents[3] / 'docs/assets/media/chemistry/results'
TEACHING_MODEL = Path(__file__).resolve().parents[3] / 'docs/chemistry/data/tio6-local.xyz'


class Session:
    def __init__(self, contents, workspace):
        self.helper = contents / 'MacOS/eigenvista-ctl'
        self.workspace = workspace
        self.connection = None

    def wait_ready(self, launcher_process):
        for _ in range(200):
            if launcher_process.poll() is not None:
                raise RuntimeError('EigenVista launcher stopped. Read the launcher log.')
            self.connection = next(self.workspace.glob('Sessions/session.*/connection.json'), None)
            if self.connection:
                result = self.run('app.state')
                if result.returncode == 0 and not json.loads(result.stdout).get('busy'):
                    self.outputs = self.connection.parent / 'Results'
                    return
            time.sleep(0.2)
        raise TimeoutError('EigenVista connector did not become ready.')

    def run(self, method, params=None, wait=None):
        command = [self.helper, '--connection', self.connection, method]
        if params is not None:
            command += ['--params', json.dumps(params)]
        if wait:
            command += ['--wait', str(wait)]
        return subprocess.run(command, capture_output=True, text=True, timeout=(wait or 18) + 10)

    def call(self, method, params=None, wait=None):
        deadline = time.monotonic() + 25
        while True:
            result = self.run(method, params, wait)
            if result.returncode == 0:
                return json.loads(result.stdout)
            error = result.stderr or result.stdout
            if time.monotonic() >= deadline or not any(kind in error for kind in ('"busy"', '"not_ready"')):
                raise RuntimeError(f'{method}: {error[-1800:]}')
            time.sleep(0.2)

    def open(self, file):
        self.call('document.open', {'path': str(file), 'discardUnsaved': True}, 50)

    def image(self, filename):
        target = self.outputs / filename
        info = self.call('image.export', {'path': str(target)})
        assert info['bytes'] == target.stat().st_size
        shutil.copyfile(target, PUBLISH / filename)

    def measurements(self, filename):
        target = self.outputs / filename
        self.call('table.export', {'kind': 'measurements', 'path': str(target)})
        shutil.copyfile(target, PUBLISH / filename)


def measure(session, key, label, kind, atoms, visible=True, color='#eff8ff'):
    data = {'id': key, 'label': label, 'kind': kind, 'atoms': atoms,
            'visible': visible, 'color': color, 'always_visible': True}
    session.call('measure.upsert', {'measurement': data})
    return session.call('measure.evaluate', {'kind': kind, 'atoms': atoms})['value']


def ligand(session, inputs):
    session.open(inputs / '1AON.cif')
    assert session.call('app.state')['document']['atomCount'] == 58870
    session.call('scene.set', {'representation': 'ball-stick', 'backgroundColor': '#101c25'})
    copies = session.call('residues.list', {'name': 'ADP', 'limit': 100})['items']
    assert len(copies) == 7
    atom_list = session.call('atoms.list', {'residueIndex': 8016, 'limit': 100})['items']
    seeds = [atom['index'] for atom in atom_list]
    assert len(seeds) == 27
    for key, whole, count, label in [('atom-cutoff', False, 74, 'ADP A:1 4 Å atoms'),
                                    ('whole-residues', True, 154, 'ADP A:1 4 Å complete residues')]:
        session.call('selection.neighborhood', {
            'seeds': seeds, 'radiusAngstrom': 4, 'wholeResidues': whole,
            'id': key, 'label': label, 'showOnly': True, 'focus': True, 'resetFilters': True}, 45)
        assert session.call('selection.get')['selectedCount'] == count
    contact = measure(session, 'contact', 'THR–ADP', 'distance', [657, 58677], color='#fee47c')
    assert abs(contact - 2.54551095) < 0.00001
    session.call('labels.upsert', {'label': {'id': 'adp', 'text': 'ADP A:1', 'residue': 8016,
                                            'visible': True, 'color': '#ffffff', 'always_visible': True}})
    session.call('selection.set', {'atoms': []})
    session.call('camera.orbit', {'horizontalDegrees': 24, 'verticalDegrees': 12})
    session.image('1aon-adp-a1.png')
    session.measurements('1aon-adp-a1.csv')
    print(f'Ligand results verified: {contact:.6f} Å', flush=True)


def protein(session, inputs):
    session.open(inputs / '1crn.bcif')
    assert session.call('app.state')['document']['atomCount'] == 327
    session.call('scene.set', {'representation': 'cartoon', 'backgroundColor': '#101c25'})
    session.call('camera.fit', {})
    session.call('camera.orbit', {'horizontalDegrees': 22, 'verticalDegrees': -19})
    for mode in ('secondary', 'residue-class'):
        session.call('structure.set', {'colorMode': mode})
        session.image(f'1crn-{mode}.png')
    print('Protein result figures generated at a shared camera', flush=True)


def solvent(session, inputs):
    session.open(inputs / '1crn.bcif')
    session.call('scene.set', {'representation': 'ball-stick', 'backgroundColor': '#101c25'})
    for kind, label, count in (('ses', 'Crambin SES', 27608), ('sas', 'Crambin SAS', 34724)):
        session.call('molecularSurfaces.generate', {'request': {
            'id': kind, 'label': label, 'kind': kind, 'atom_indices': [],
            'radii_set': 'bondi', 'radii_overrides': [], 'probe_radius': 1.4,
            'spacing': 0.5, 'color': '#85aebe', 'opacity': 1}}, 50)
        surface = next(item for item in session.call('molecularSurfaces.list')['items']
                       if item['id'] == kind)
        assert surface['triangleCount'] == count, surface
    session.call('camera.fit', {})
    session.call('camera.orbit', {'horizontalDegrees': 22, 'verticalDegrees': -19})
    session.call('molecularSurfaces.set', {'id': 'sas', 'visible': False})
    session.image('1crn-ses.png')
    session.call('molecularSurfaces.set', {'id': 'ses', 'visible': False})
    session.call('molecularSurfaces.set', {'id': 'sas', 'visible': True})
    session.image('1crn-sas.png')
    print('SES/SAS figures verified: 27,608 and 34,724 triangles', flush=True)


def coordination(session, inputs):
    session.open(inputs / 'tio6-local.xyz')
    session.call('scene.set', {'representation': 'ball-stick', 'backgroundColor': '#101c25'})
    checks = [
        ('equatorial', 'Equatorial Ti–O', 'distance', [0, 1], 1.95, True, '#a8dfcc'),
        ('axial', 'Axial Ti–O', 'distance', [0, 5], 2.1, True, '#fee47c'),
        ('equatorial-axial', 'Equatorial–axial O–Ti–O', 'angle', [1, 0, 5], 90, False, '#ffffff'),
        ('opposite', 'Opposite axial O–Ti–O', 'angle', [5, 0, 6], 180, False, '#ffffff'),
        ('torsion', 'Example O–Ti–O–O torsion', 'torsion', [1, 0, 3, 5], -90, False, '#ffffff'),
    ]
    for key, label, kind, atoms, expected, visible, color in checks:
        actual = measure(session, key, label, kind, atoms, visible, color)
        assert abs(actual - expected) < 0.00001, (key, actual)
    session.call('labels.upsert', {'label': {'id': 'ti', 'text': 'Ti', 'atom': 0,
                                            'visible': True, 'color': '#ffffff', 'always_visible': True}})
    session.call('camera.fit', {})
    session.call('camera.orbit', {'horizontalDegrees': 25, 'verticalDegrees': 29})
    session.image('tio6-local-geometry.png')
    session.measurements('tio6-local-geometry.csv')
    with (PUBLISH / 'tio6-local-geometry.csv').open(encoding='utf-8', newline='') as table:
        assert len(list(csv.DictReader(table))) == 5
    print('Coordination result verified: five measurements', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('app', type=Path, help='EigenVista.app from the 0.10.6 release')
    parser.add_argument('upstream', type=Path, help='EigenVista upstream checkout')
    parser.add_argument('--only', choices=['ligand', 'protein', 'solvent', 'coordination'])
    args = parser.parse_args()
    contents = args.app.resolve() / 'Contents'
    sources = {'1AON.cif': args.upstream / 'site/downloads/1AON.cif',
               '1crn.bcif': args.upstream / 'fixtures/bcif/1crn.bcif',
               'tio6-local.xyz': TEACHING_MODEL}
    PUBLISH.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='eigenvista-chemistry-capture-', dir='/private/tmp') as directory:
        workspace = Path(directory)
        inputs = workspace / 'Inputs'
        inputs.mkdir()
        for name, source in sources.items():
            shutil.copyfile(source, inputs / name)
        log = workspace / 'launcher.log'
        launcher = contents / 'Resources/AI-connector/Start AI connection.command'
        with log.open('w+b') as stream:
            owned = subprocess.Popen([launcher, '--workspace', workspace], stdin=subprocess.DEVNULL,
                                     stdout=stream, stderr=stream)
            try:
                session = Session(contents, workspace)
                session.wait_ready(owned)
                for name, capture in [('ligand', ligand), ('protein', protein),
                                      ('solvent', solvent), ('coordination', coordination)]:
                    if args.only is None or args.only == name:
                        capture(session, inputs)
            except Exception:
                print(log.read_text()[-1800:])
                raise
            finally:
                if owned.poll() is None:
                    owned.terminate()
                    try:
                        owned.wait(10)
                    except subprocess.TimeoutExpired:
                        owned.kill()
                        owned.wait(5)
