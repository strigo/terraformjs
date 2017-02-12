terraformjs
===========

[![Travis Build Status](https://travis-ci.org/strigo/terraformjs.svg?branch=master)](https://travis-ci.org/strigo/terraformjs)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/kuf0x8j62kts1bpg/branch/master?svg=true)](https://ci.appveyor.com/project/strigo/terraformjs)
[![Code Coverage](https://codecov.io/github/strigo/terraformjs/coverage.svg?branch=master)](https://codecov.io/github/strigo/terraformjs?branch=master)
[![Code Climate](https://codeclimate.com/github/strigo/terraformjs/badges/gpa.svg)](https://codeclimate.com/github/strigo/terraformjs)
[![Dependency Status](https://img.shields.io/david/strigo/terraformjs.svg?style=flat-square)](https://david-dm.org/strigo/terraformjs)
[![Known Vulnerabilities](https://snyk.io/test/npm/terraformjs/badge.svg?style=flat-square)](https://snyk.io/test/npm/terraformjs)


terraformjs is a javascript wrapper for terraform, which aims to provide an simple API to execute terraform commands from a nodejs app.


## Alternatives

There don't appear to be any.


## Installation

```shell
$ npm install [-g] terraformjs
```

## Usage

```javascript

var terraform = require('terraformjs')

let tf = new terraform.Terraform('/path/to/terraform/dir');
let outcome = tf.apply()
console.log(outcome.stdout)

```


## Contributions..

See [CONTRIBUTIONS](https://github.com/strigo/terraformjs/blob/master/CONTRIBUTING.md)

Pull requests are always welcome..
