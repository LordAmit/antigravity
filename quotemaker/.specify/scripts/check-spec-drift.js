import { execSync } from 'child_process';

function checkSpecDrift() {
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);

    const srcChanged = stagedFiles.some(f => f.startsWith('src/'));
    const specChanged = stagedFiles.some(f => f.startsWith('.specify/'));

    if (srcChanged && !specChanged) {
      console.log('\n⚠️  [Spec-Drift Warning]: You staged changes in "src/" but none in ".specify/".');
      console.log('   Always verify if functional requirements or architecture plans need updates.');
      console.log('   Keep specs as the single source of truth!\n');
    }
  } catch (err) {
    // Fail silently if git command fails
  }
}

checkSpecDrift();
