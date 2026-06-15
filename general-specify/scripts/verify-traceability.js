import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

function getSpecFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getSpecFiles(fullPath, files);
      }
    } else if (file.endsWith('.spec.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function getRequirements() {
  const specFiles = getSpecFiles(path.join(projectRoot, 'src'));
  let allReqs = [];
  for (const file of specFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const regex = /\[REQ-[A-Z]+-\d+\]/g;
    const matches = content.match(regex) || [];
    allReqs.push(...matches);
  }
  return [...new Set(allReqs)];
}

function getTestFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getTestFiles(fullPath, files);
      }
    } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function verifyTraceability() {
  const reqs = getRequirements();
  const testFiles = getTestFiles(projectRoot);
  
  // Read all test files content
  const combinedTestContent = testFiles.map(file => fs.readFileSync(file, 'utf-8')).join('\n');
  
  console.log(`\n🔍 Found ${reqs.length} requirements in colocated spec files.`);
  console.log(`📂 Scanned ${testFiles.length} test files for trace IDs.`);
  
  const missing = [];
  for (const req of reqs) {
    if (!combinedTestContent.includes(req)) {
      missing.push(req);
    }
  }
  
  if (missing.length > 0) {
    console.error(`\n❌ Traceability Check Failed! The following requirements have no matching test traces:`);
    missing.forEach(req => console.error(`  - ${req}`));
    process.exit(1);
  } else {
    console.log(`\n✅ Traceability Check Passed! All requirements are fully mapped in test suites.\n`);
    process.exit(0);
  }
}

verifyTraceability();
