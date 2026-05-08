#!/bin/bash
rm .DS_Store
rsync -av --delete dist/ /Users/amitsealami/git/publish/ai/borderify/
