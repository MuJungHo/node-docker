const ldapjs = require('ldapjs');

const config = {
  ldapURL: 'ldap://deltaldap.deltaww.com',
  adminDN: 'CN=Service.LDAP,OU=Service,OU=Users,OU=TWTP1,OU=TW,OU=Delta,DC=delta,DC=corp',
  adminPwd: 'Mpool!@#123',
  searchDn: 'OU=Delta,DC=delta,DC=corp'
};

const ldap = {};

ldap.init = () => {

  const client = ldapjs.createClient({
    url: config.ldapURL,
  });

  client.on('error', err => {
    console.log('ldap error', err);
  });

  client.on('connect', () => {
    console.log('ldap connect');
  });

  client.bind(config.adminDN, config.adminPwd, (err) => {

    if (err) {
      console.log('Error occurred while binding');
    } else {
      var base = "OU=Delta,DC=delta,DC=corp";
      var search_options = {
        // scope: 'sub',
        filter: "'(objectCategory=person)(objectClass=person)(userPrincipalName=*)'",
        attributes: ['cn', 'mail', 'company', 'department', 'sn', 'telephoneNumber', 'userPrincipalName']
      };
      const opts = {
        timeLimit: 500,
        filter: `(userPrincipalName=*})`,
        attributes: ['cn', 'mail', 'company', 'department', 'sn', 'telephoneNumber', 'userPrincipalName']
      };

      client.search(base, opts, function (err, res) {
        if (err) {
          console.log('Error occurred while ldap search');
        } else {
          res.on('searchEntry', function (entry) {
            console.log('Entry', JSON.stringify(entry.object));
          });
          res.on('searchReference', function (referral) {
            console.log('Referral', referral);
          });
          res.on('error', function (err) {
            console.log('Error is', err);
          });
          res.on('end', function (result) {
            console.log('Result is', result);
          });
        }
      });
    }
  });
}

module.exports = ldap;