const terraform = require('terraformjs');

// let tf = new terraform.Terraform('./', true, true);
// let outcome = tf.apply(process.cwd(), {'state': 'my-state-file.tfstate',
//           'var': {'foo': 'bar', 'bah': 'boo'},
//           'vars_file': ['x.tfvars', 'y.tfvars']})
const tf = new terraform.Terraform();
const outcome = tf.apply(process.cwd(), { state: 'my-state-file.tfstate' });
console.log(outcome.stdout);
