#!/usr/bin/env node

'use strict';

const fs = require('fs');
const git = require('simple-git/promise');
const path = require('path');
const trueCasePathSync = require('true-case-path');
const zip = require('lodash.zip');

const SEPARATOR = path.sep;

function components(file) {
  return file.split(new RegExp(`\\${SEPARATOR}`, 'g'));
}

function checkFile(file) {
  const realPath = fs.realpathSync(file);
  const trueCasePath = trueCasePathSync(realPath);

  if (realPath !== trueCasePath) {
    const a = components(trueCasePath);
    const b = components(realPath);

    const aCurrent = [];
    const bCurrent = [];

    zip(a, b).forEach(([aPart, bPart]) => {
      aCurrent.push(aPart);
      bCurrent.push(bPart);

      if (aPart !== bPart) {
        const aString = aCurrent.join(SEPARATOR);
        const bString = bCurrent.join(SEPARATOR);

        console.log(`Renaming ${aString} to ${bString}`);

        fs.renameSync(aString, bString);
      }
    });
  }
}

function checkFiles(files) {
  files.forEach(checkFile);
}

git().raw(['ls-files'])
  .then(response => checkFiles(response.split(/[\r\n]+/g)))
  .catch(error => console.error(error));
