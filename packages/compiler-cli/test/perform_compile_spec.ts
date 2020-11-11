/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {readConfiguration} from '../src/perform_compile';

import {setup, TestSupport} from './test_support';

describe('perform_compile', () => {
  let support: TestSupport;
  let basePath: string;

  beforeEach(() => {
    support = setup();
    basePath = support.basePath;
  });

  function writeSomeConfigs() {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "./tsconfig-level-2.json",
          "angularCompilerOptions": {
            "annotateForClosureCompiler": true
          }
        }
      `,
      'tsconfig-level-2.json': `{
          "extends": "./tsconfig-level-3.json",
          "angularCompilerOptions": {
            "skipMetadataEmit": true
          }
        }
      `,
      'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "annotateForClosureCompiler": false,
            "annotationsAs": "decorators"
          }
        }
      `,
    });
  }

  it('should merge tsconfig "angularCompilerOptions"', () => {
    writeSomeConfigs();
    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options.annotateForClosureCompiler).toBe(true);
    expect(options.annotationsAs).toBe('decorators');
    expect(options.skipMetadataEmit).toBe(true);
  });

  it(`should return 'enableIvy: true' when enableIvy is not defined in "angularCompilerOptions"`,
     () => {
       writeSomeConfigs();
       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options.enableIvy).toBe(true);
     });

  it(`should return 'enableIvy: false' when enableIvy is disabled in "angularCompilerOptions"`,
     () => {
       writeSomeConfigs();
       support.writeFiles({
         'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "enableIvy": false
          }
        }
      `,
       });

       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options.enableIvy).toBe(false);
     });

  it(`should return absolute paths for genDir`, () => {
    support.writeFiles({
      'tsconfig-genDir.json': `{}`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-genDir.json'));
    expect(path.isAbsolute(options.genDir!)).toBeTrue();
  });

  it(`should return absolute paths for basePath`, () => {
    support.writeFiles({
      'tsconfig-basePath.json': `{}`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-basePath.json'));
    expect(path.isAbsolute(options.basePath!)).toBeTrue();
  });

  it(`should return absolute paths for rootDir`, () => {
    support.writeFiles({
      'tsconfig-rootDir.json': `{
        "compilerOptions": {
          "rootDir": "./relative"
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-rootDir.json'));
    expect(path.isAbsolute(options.rootDir!)).toBeTrue();
  });

  it(`should return absolute paths for rootDirs`, () => {
    support.writeFiles({
      'tsconfig-rootDirs.json': `{
        "compilerOptions": {
          "rootDirs": ["./relative", "/abs/path"]
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-rootDirs.json'));
    console.log(JSON.stringify(options, null, 4));
    expect(options.rootDirs?.length).toBe(2);
    expect(options.rootDirs!.every(p => path.isAbsolute(p))).toBeTrue();
    expect(options.rootDirs![0].endsWith("/relative")).toBeTrue();
    expect(options.rootDirs![1]).toBe("/abs/path");
  });

  it(`should return absolute paths for baseUrl`, () => {
    support.writeFiles({
      'tsconfig-baseUrl.json': `{
        "compilerOptions": {
          "baseUrl": "./relative"
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-baseUrl.json'));
    expect(path.isAbsolute(options.baseUrl!)).toBeTrue();
  });

  it(`should return absolute paths for project`, () => {
    support.writeFiles({
      'tsconfig-project.json': `{
        "compilerOptions": {
          "project": "./relative"
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-project.json'));
    expect(path.isAbsolute(options.project!)).toBeTrue();
  });

  it(`should return absolute paths for outDir`, () => {
    support.writeFiles({
      'tsconfig-outDir.json': `{
        "compilerOptions": {
          "outDir": "./relative"
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-outDir.json'));
    expect(path.isAbsolute(options.outDir!)).toBeTrue();
  });

  it(`should return absolute paths for outFile`, () => {
    support.writeFiles({
      'tsconfig-outFile.json': `{
        "compilerOptions": {
          "outFile": "./relative"
        }
      }`
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-outFile.json'));
    expect(path.isAbsolute(options.outFile!)).toBeTrue();
  });
});
