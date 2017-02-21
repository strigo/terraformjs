const assert = require('assert');
const proxyquire = require('proxyquire');
const terraform = require('../src/index.js');


/**
 * Returns a terraform object with stub shelljs object for version testing
 * @param  {String} output The output of `terraform --version`
 * @return {Object}        terraformjs object
 */
function makeTerraformStub(output) {
  const shStub = {};
  shStub.exec = function execute() {
    return { stdout: output };
  };
  return proxyquire('../src/index', { shelljs: shStub });
}


// Test terraform apply
describe.only('applyCommand', () => {
  describe('noOptions', () => {
    it('should return the help text when running `terraform`', () => {
      const terraformStub = makeTerraformStub('apply output');
      const tf = new terraformStub.Terraform();
      const outcome = tf.apply();

      assert.equal(outcome.stdout, 'apply output');
      assert.equal(outcome.command, 'terraform apply');
    });
  });

  describe('withPath', () => {
    it('should return the help text when running `terraform`', () => {
      const terraformStub = makeTerraformStub('apply output');
      const tf = new terraformStub.Terraform();
      const outcome = tf.apply({}, '/tf/path');

      assert.equal(outcome.stdout, 'apply output');
      assert.equal(outcome.command, 'terraform apply /tf/path');
    });
  });
});


// Test arbitrary terraform command
describe('terraformCommand', () => {
  describe('noOptions', () => {
    it('should return the help text when running `terraform`', () => {
      const terraformStub = makeTerraformStub('terraform help string');
      const tf = new terraformStub.Terraform();
      const outcome = tf.terraform();

      assert.equal(outcome.stdout, 'terraform help string');
      assert.equal(outcome.command, 'terraform');
    });
  });

  describe('withSubCommand', () => {
    it('should return output of a command `terraform SUBCOMMAND`', () => {
      const terraformStub = makeTerraformStub('output of command');
      const tf = new terraformStub.Terraform();
      const outcome = tf.terraform('apply');

      assert.equal(outcome.stdout, 'output of command');
      assert.equal(outcome.command, 'terraform apply');
    });
  });

  describe('withSubCommandAndOptions', () => {
    it('should return output of a command `terraform SUBCOMMAND -opts`', () => {
      const terraformStub = makeTerraformStub('output of command');
      const tf = new terraformStub.Terraform();
      const outcome = tf.terraform('apply -no-color');

      assert.equal(outcome.stdout, 'output of command');
      assert.equal(outcome.command, 'terraform apply -no-color');
    });
  });
});

// Test `terraform --version`
describe('terraformVersion', () => {
  describe('ClearVersion', () => {
    const versionOutput = 'Terraform v0.0.1';
    const terraformStub = makeTerraformStub(versionOutput);

    it('should return the version of terraform', () => {
      assert.equal(terraformStub.version(), '0.0.1');
    });
  });

  describe('ClearVersion', () => {
    const versionOutput = `Terraform v0.0.2

    Your version of Terraform is out of date! The latest version
    is 0.8.7. You can update by downloading from www.terraform.io`;
    const terraformStub = makeTerraformStub(versionOutput);

    it('should return the version of terraform', () => {
      assert.equal(terraformStub.version(), '0.0.2');
    });
  });
});

// Test argument normalization
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

// Test options string construction
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
