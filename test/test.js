const assert = require('assert');
const terraform = require('../src/index.js');

describe('terraformVersion', () => {
  it('should return the version of terraform', () => {
    assert.equal(terraform.version(), '0.8.5');
  });
});

describe('normalizeArgName', () => {
  describe('withDash', () => {
    it('should convert `my_option` to `-my-option`', () => {
      assert.equal(terraform.Terraform._normalizeArg('vars_file'), '-vars-file');
    });
  });

  describe('noDash', () => {
    it('should convert `option` to `-option`', () => {
      assert.equal(terraform.Terraform._normalizeArg('option'), '-option');
    });
  });
});

describe('constructOptString', () => {
  describe('noOpts', () => {
    const tf = new terraform.Terraform();

    it('should return an empty object', () => {
      assert.equal(tf._constructOptString({}), '');
    });
  });

  describe('noOptsNoColor', () => {
    const tf = new terraform.Terraform('./', false, true);

    it('should return the ` -no-color` option', () => {
      assert.equal(tf._constructOptString({}), ' -no-color');
    });
  });

  describe('allOpts', () => {
    const tf = new terraform.Terraform();
    const optObj = {
      force: true,
      state: 'x.tfstate',
      var: { foo: 'bar', bah: 'boo' },
      vars_file: ['y.tfvars', 'z.tfvars'],
    };
    const optString = " -force -state=x.tfstate -var 'foo=bar' -var 'bah=boo' -vars-file=y.tfvars -vars-file=z.tfvars";

    it('should return the ` -no-color` option', () => {
      assert.equal(tf._constructOptString(optObj), optString);
    });
  });
});
