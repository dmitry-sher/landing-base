#!/bin/bash

cd source
gulp build

cd ..
export BRANCH=`git rev-parse --abbrev-ref HEAD`
git add .
git commit
git push origin $BRANCH
date