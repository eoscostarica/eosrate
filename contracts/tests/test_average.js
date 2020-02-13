const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder

const contract_acct="rateproducer";

const rateproducer_priv_key='5HrYs51N1PsqD36hHEPmbQC1Bua4nYTKSRTm2sjA5LeQjJ9gUqN';
const rateproducer_pub_key='EOS7Ca5Tc4KaEYLZdu2WxdQQktVePjFiDg42EmMAjqVR6eNKPMrAA';
const MIN_VAL = 0;
const MAX_VAL = 10;
const MAX_ROWS = 150;

const signatureProvider = new JsSignatureProvider([rateproducer_priv_key]);
const rpc = new JsonRpc('http://monitor.jungletestnet.io:8888', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
const get = require('lodash.get')
var chai = require('chai'),assert = chai.assert;

var voters_acc = ["eoscrvoter11","eoscrvoter12","eoscrvoter13","eoscrvoter14","eoscrvoter15"];

var bp_accts_25 = [
                "eoscrprodo11","eoscrprodo12","eoscrprodo13","eoscrprodo14","eoscrprodo15",
                "eoscrprodo21","eoscrprodo22","eoscrprodo23","eoscrprodo24","eoscrprodo25",
                "eoscrprodo31","eoscrprodo32","eoscrprodo33","eoscrprodo34","eoscrprodo35",
                "eoscrprodo41","eoscrprodo42","eoscrprodo43","eoscrprodo44","eoscrprodo45",
                "eoscrprodo51","eoscrprodo52","eoscrprodo53","eoscrprodo54","eoscrprodo55"
                 ];


function cmp_bp_stats(data_a,data_b) {
    
    if(data_a['ratings_cntr'] != data_b['ratings_cntr']){
        return false;
    }
    if(data_a['average'] != data_b['average']){
        return false;
    }
    if(data_a['transparency'] != data_b['transparency']){
        return false;
    }
    if(data_a['infrastructure'] != data_b['infrastructure']){
        return false;
    }
    if(data_a['trustiness'] != data_b['trustiness']){
        return false;
    }
    if(data_a['community'] != data_b['community']){
        return false;
    }
    if(data_a['development'] != data_b['development']){
        return false;
    }
    return true;  
   }

function get_bp_stats(bp_name,data) {
    var result = new Array(7);
    result['ratings_cntr'] = 0;
    result['average'] = 0;
    result['transparency'] = 0;
    result['infrastructure'] = 0;
    result['trustiness'] = 0;
    result['development'] = 0;
    result['community'] = 0;
    if(data.length==0){
        return result;
    }
    
    for(index =0 ; index < data.length; index++ ){
        if(data[index].bp==bp_name){
            result['ratings_cntr'] = Number.parseInt(data[index].ratings_cntr);
            result['average'] = Number.parseFloat(data[index].average).toFixed(1);
            result['transparency'] = Number.parseFloat(data[index].transparency).toFixed(1);
            result['infrastructure'] = Number.parseFloat(data[index].infrastructure).toFixed(1);
            result['trustiness'] = Number.parseFloat(data[index].trustiness).toFixed(1);
            result['development'] = Number.parseFloat(data[index].development).toFixed(1);
            result['community'] = Number.parseFloat(data[index].community).toFixed(1);
            return result;
        }
        
    }
    return result;
   }

  

describe ('Eos-rate unit test', function(){
    /*
    it('Register accounts as block producers',async () => {

        for(index =0 ; index < bp_accts_25.length; index++ ){  
          try {
              const result = await api.transact({
                  actions: [{
                    account: 'eosio',
                    name: 'regproducer',
                    authorization: [{
                      actor: bp_accts_25[index],
                      permission: 'active',
                    }],
                    data: {
                      producer: bp_accts_25[index],
                      producer_key : rateproducer_pub_key,
                      url:'https://eoscostarica.io',
                      location:'0',
                    },
                  }]
                }, {
                  blocksBehind: 3,
                  expireSeconds: 30,
                });
            } catch (err) {
              console.log('\nCaught exception: ' + err);
              if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
            }
        }
    });
    
    
     it('Set up voters accounts',async () => {
         for(index =0 ; index < voters_acc.length; index++ ){  
              try {
                  const result = await api.transact({
                      actions: [{
                        account: 'eosio',
                        name: 'voteproducer',
                        authorization: [{
                          actor: voters_acc[index],
                          permission: 'active',
                        }],
                        data: {
                          voter: voters_acc[index],
                          proxy: '',
                          producers: bp_accts_25,
                        },
                      }]
                    }, {
                      blocksBehind: 3,
                      expireSeconds: 30,
                    });
                } catch (err) {
                 console.log('\nCaught exception: ' + err);
                  if (err instanceof RpcError)
                    console.log(JSON.stringify(err.json, null, 2));
                }
         }
    });
    */
    
    it('Clean dummy data',async () => {

        for(index =0 ; index < bp_accts_25.length; index++ ){  
          try {
              const result = await api.transact({
                  actions: [{
                    account: contract_acct,
                    name: 'erase',
                    authorization: [{
                      actor: contract_acct,
                      permission: 'active',
                    }],
                    data: {
                      bp_name: bp_accts_25[index],
                    },
                  }]
                }, {
                  blocksBehind: 3,
                  expireSeconds: 60,
                });
            } catch (err) {
              console.log('\nCaught exception: ' + err);
              if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
            }
        }
    });
    
    it('Voting with zero values',async () => {
        
        try {
            const result = await api.transact({
                actions: [{
                  account: contract_acct,
                  name: 'rate',
                  authorization: [{
                    actor: voters_acc[0],
                    permission: 'active',
                  }],
                  data: {
                    user: voters_acc[0],
                    bp: bp_accts_25[0],
                    transparency:0,
                    infrastructure:0,
                    trustiness:0,
                    development:0,
                    community:0,
                  },
                }]
              }, {
                blocksBehind: 3,
                expireSeconds: 30,
              });
          } catch (err) {
             let errorMessage =  get(err, 'json.error.details[0].message')
             errorMessage && (errorMessage = errorMessage.replace('assertion failure with message:', '').trim())
             assert.equal('eosio_assert_message_exception', get(err, 'json.error.name') || '')
             assert.equal(errorMessage, 'Error vote must have value for at least one category')
          }
        
    });
   
    it('Voting/Update only one category for prod25',async () => {
        
        try {  
                let vote_1 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[0],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[0],
                        bp: bp_accts_25[24],
                        transparency:6,
                        infrastructure:0,
                        trustiness:0,
                        development:0,
                        community:0,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                var expected_row = new Array(7);
                expected_row['ratings_cntr'] = 1;
                expected_row['average'] ='6.0';
                expected_row['transparency'] = '6.0';
                expected_row['infrastructure'] = '0.0';
                expected_row['trustiness'] = '0.0';
                expected_row['development'] = '0.0';
                expected_row['community'] = '0.0';
            
                //read stats table from the blockchain
                let read_stats = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
               var stats_row = get_bp_stats(bp_accts_25[24],read_stats.rows);
               var flag = cmp_bp_stats(expected_row,stats_row);
               if(!flag){
                   console.log('\nactual:\n');
                   console.log(stats_row);
                   console.log('\nnexpected:\n');
                   console.log(expected_row)
               }
               assert(flag, 'Voting/Update only one category for prod25. check agains stats table');
            
               //update the vote
               let vote_2 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[0],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[0],
                        bp: bp_accts_25[24],
                        transparency:0,
                        infrastructure:7,
                        trustiness:8,
                        community:9,  
                        development:10,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
                
               
                expected_row['ratings_cntr'] = 1;
                expected_row['average'] = '8.5';
                expected_row['transparency'] = '0.0';
                expected_row['infrastructure'] = '7.0';
                expected_row['trustiness'] = '8.0';
                expected_row['development'] = '10.0';
                expected_row['community'] = '9.0';
            
                             
                //read stats table from the blockchain
                let read_stats_2 = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
               var stats_row2 = get_bp_stats(bp_accts_25[24],read_stats_2.rows);
               var flag2 = cmp_bp_stats(expected_row,stats_row2); 
               if(!flag2){
                   console.log('\nactual:\n');
                   console.log(stats_row2);
                   console.log('\nexpected:\n');
                   console.log(expected_row)
               }
               assert(flag2, 'Voting/Update only one category for prod25. check agains stats table after update vote');
            

          } catch (err) {
                console.log('\nCaught exception: ' + err);
                if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
          }
          
    });
    
  
    
    it('Update categories with zero',async () => {
        
        try {  
                let vote_1 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[1],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[1],
                        bp: bp_accts_25[23],
                        transparency:1,
                        infrastructure:2,
                        trustiness:3,
                        development:4,
                        community:5,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                var expected_row = new Array(7);
                expected_row['ratings_cntr'] = '1';
                expected_row['average'] = '3.0';
                expected_row['transparency'] = '1.0';
                expected_row['infrastructure'] = '2.0';
                expected_row['trustiness'] = '3.0';
                expected_row['development'] = '4.0';
                expected_row['community'] = '5.0';
            
                
            
                //read stats table from the blockchain
                let read_stats_1 = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
               var stats_row_3 = get_bp_stats(bp_accts_25[23],read_stats_1.rows);
               let flag3 = cmp_bp_stats(expected_row,stats_row_3); 
               if(!flag3){
                   console.log('\n actual:\n');
                   console.log(stats_row_3);
                   console.log('\n expected:\n');
                   cosole.log(expected_row);
               } 
               assert(flag3, 'Update categories with zero. check agains stats table');
            
               //update the vote
               let vote_2 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[1],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[1],
                        bp: bp_accts_25[23],
                        transparency:1,
                        infrastructure:0,
                        trustiness:3,
                        development:0,
                        community:5,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                expected_row['ratings_cntr'] = 1;
                expected_row['average'] = 3;
                expected_row['transparency'] = 1;
                expected_row['infrastructure'] = 0;
                expected_row['trustiness'] = 3;
                expected_row['development'] = 0;
                expected_row['community'] = 5;
            
                //read stats table from the blockchain
                let read_stats_4 = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
                let stats_row_4 = get_bp_stats(bp_accts_25[23],read_stats_4.rows);
                let flag4 = cmp_bp_stats(expected_row,stats_row_4);
                if(!flag4){
                   console.log('\n actual:\n');
                   console.log(stats_row_4);
                   console.log('\n expected:\n');
                   console.log(expected_row);
                }
                assert(flag4, 'Update categories with zero. check agains stats table after update');
          } catch (err) {
                console.log('\nCaught exception: ' + err);
                if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
          }
          
    });
    
    
 
/*
 blockproducer vote chart for bp_producer22 (index 22)
 ---------------------------------------------------------------------------------------------------------
             average | cntr      | transparency | infraestructure | trustiness| development | community
 ---------------------------------------------------------------------------------------------------------
    voter1 |   3.6   |          |     7        |         2       |     1     |       3     |      5
    voter2 |   5.2   |          |     3        |         7       |     6     |       9     |      1
  --------------------------------------------------------------------------------------------------------
Expected   |   4.4   |     2    |     5        |        4.5      |    3.5    |       6     |      3


*/  
    
    it('2 voters',async () => {
        
        try {  
                let vote1 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[1],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[1],
                        bp: bp_accts_25[22],
                        transparency:7,
                        infrastructure:2,
                        trustiness:1,
                        development:3,
                        community:5,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                let vote2 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[2],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[2],
                        bp: bp_accts_25[22],
                        transparency:3,
                        infrastructure:7,
                        trustiness:6,
                        development:9,
                        community:1,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                
                var expected_row = new Array(7);
                expected_row['ratings_cntr'] = 2;
                expected_row['average'] = 4.4;
                expected_row['transparency'] = 5;
                expected_row['infrastructure'] = 4.5;
                expected_row['trustiness'] = 3.5;
                expected_row['development'] = 6;
                expected_row['community'] = 3;
            
                //read stats table from the blockchain
                let read_stats_2 = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
               var stats_row_3 = get_bp_stats(bp_accts_25[22],read_stats_2.rows);
               let flag = cmp_bp_stats(expected_row,stats_row_3);
               if(!flag){
                   console.log('\n actual:\n');
                   console.log(stats_row_3);
                   console.log('\n expected:\n');
                   console.log(expected_row);
               }
                
               assert(flag, '2 voters. check agains stats table');
        

          } catch (err) {
                console.log('\nCaught exception: ' + err);
                if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
                
          }
          
    });
    
/*
     blockproducer vote chart for bp_producer5 (index 5)
     ---------------------------------------------------------------------------------------------------------
                 average | cntr      | transparency | infraestructure | trustiness| development | community
     ---------------------------------------------------------------------------------------------------------
        voter1 |   3.6   |     5     |     7        |         2       |     1     |       3     |      5
        voter2 |   5.2   |     5     |     3        |         7       |     6     |       9     |      1
        voter3 |   4.6   |     5     |     4        |         6       |     7     |       1     |      5
        voter4 |   5.6   |     5     |     5        |         8       |     4     |       7     |      4
        voter5 |   5.2   |     5     |     9        |         3       |     2     |       5     |      7
      --------------------------------------------------------------------------------------------------------
    Expected   |   4.84  |     5     |    5.6       |        5.2      |     4     |       5     |      4.4
    
*/    
    
    /*
    
    it('5 voters',async () => {
       
        try {  
                const vote1 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[0],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[0],
                        bp: bp_accts_25[5],
                        transparency:7,
                        infrastructure:2,
                        trustiness:1,
                        development:3,
                        community:5,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                const vote2 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[1],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[1],
                        bp: bp_accts_25[5],
                        transparency:3,
                        infrastructure:7,
                        trustiness:6,
                        development:9,
                        community:1,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                const vote3 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[2],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[2],
                        bp: bp_accts_25[5],
                        transparency:4,
                        infrastructure:6,
                        trustiness:7,
                        development:1,
                        community:5,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
               const vote4 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[3],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[3],
                        bp: bp_accts_25[5],
                        transparency:5,
                        infrastructure:8,
                        trustiness:4,
                        development:7,
                        community:4,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
               const vote5 = await api.transact({
                actions: [{
                      account: contract_acct,
                      name: 'rate',
                      authorization: [{
                        actor: voters_acc[4],
                        permission: 'active',
                      }],
                      data: {
                        user: voters_acc[4],
                        bp: bp_accts_25[5],
                        transparency:9,
                        infrastructure:3,
                        trustiness:2,
                        development:5,
                        community:7,
                      },
                    }]
                  }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                 });
            
                var expected_row = new Array(7);
                expected_row['ratings_cntr'] = 5;
                expected_row['average'] = 4.8;
                expected_row['transparency'] = 5.6;
                expected_row['infrastructure'] = 5.2;
                expected_row['trustiness'] = 4;
                expected_row['development'] = 5;
                expected_row['community'] = 4.4;
            
                //read stats table from the blockchain
                const stats = await rpc.get_table_rows({
                    json: true,              // Get the response as json
                    code: contract_acct,     // Contract that we target
                    scope: contract_acct,         // Account that owns the data
                    table: 'stats',        // Table name
                    limit: MAX_ROWS,               // Maximum number of rows that we want to get
                });
               
               var stats_row = get_bp_stats(bp_accts_25[5],stats.rows);
            
               assert(cmp_bp_stats(expected_row,stats_row), '5 voters. stats table'+voters_acc[1]+' voting for '+bp_accts_25[0]);
            
            

          } catch (err) {
                console.log('\nCaught exception: ' + err);
                if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
          }
          
    });
    
    */
    /*
    it('Removing voters from accounts',async () => {
         for(index =0 ; index < voters_acc.length; index++ ){  
              try {
                  const result = await api.transact({
                      actions: [{
                        account: 'eosio',
                        name: 'voteproducer',
                        authorization: [{
                          actor: voters_acc[index],
                          permission: 'active',
                        }],
                        data: {
                          voter: voters_acc[index],
                          proxy: '',
                          producers: '',
                        },
                      }]
                    }, {
                      blocksBehind: 3,
                      expireSeconds: 30,
                    });
                } catch (err) {
                 console.log('\nCaught exception: ' + err);
                  if (err instanceof RpcError)
                    console.log(JSON.stringify(err.json, null, 2));
                }
         }
    });
    
    it('Unregister producers accounts',async () => {

    for(index =0 ; index < bp_accts_25.length; index++ ){  
      try {
          const result = await api.transact({
              actions: [{
                account: 'eosio',
                name: 'unregprod',
                authorization: [{
                  actor: bp_accts_25[index],
                  permission: 'active',
                }],
                data: {
                  producer: bp_accts_25[index],
                },
              }]
            }, {
              blocksBehind: 3,
              expireSeconds: 30,
            });
        } catch (err) {
         console.log('\nCaught exception: ' + err);
          if (err instanceof RpcError)
            console.log(JSON.stringify(err.json, null, 2));
        }
    }
    });
    
    it('Clean dummy data',async () => {

        for(index =0 ; index < bp_accts_25.length; index++ ){  
          try {
              const result = await api.transact({
                  actions: [{
                    account: contract_acct,
                    name: 'erase',
                    authorization: [{
                      actor: contract_acct,
                      permission: 'active',
                    }],
                    data: {
                      bp_name: bp_accts_25[index],
                    },
                  }]
                }, {
                  blocksBehind: 3,
                  expireSeconds: 30,
                });
            } catch (err) {
              console.log('\nCaught exception: ' + err);
              if (err instanceof RpcError)
                console.log(JSON.stringify(err.json, null, 2));
            }
        }
    });
*/
 
});
