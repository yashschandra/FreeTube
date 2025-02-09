#!/bin/bash

rm -rf release
pkg .
cd release
tar -zcvf freetube-macos-arm64.tar.gz freetube
