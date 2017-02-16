"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _errors = require("./errors");

var NotFoundError = _errors.NotFoundError;
var NetworkError = _errors.NetworkError;
var BadRequestError = _errors.BadRequestError;

var AccountCallBuilder = require("./account_call_builder").AccountCallBuilder;

var LedgerCallBuilder = require("./ledger_call_builder").LedgerCallBuilder;

var TransactionCallBuilder = require("./transaction_call_builder").TransactionCallBuilder;

var OperationCallBuilder = require("./operation_call_builder").OperationCallBuilder;

var OfferCallBuilder = require("./offer_call_builder").OfferCallBuilder;

var OrderbookCallBuilder = require("./orderbook_call_builder").OrderbookCallBuilder;

var PathCallBuilder = require("./path_call_builder").PathCallBuilder;

var PaymentCallBuilder = require("./payment_call_builder").PaymentCallBuilder;

var EffectCallBuilder = require("./effect_call_builder").EffectCallBuilder;

var FriendbotBuilder = require("./friendbot_builder").FriendbotBuilder;

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var Account = _stellarBase.Account;

var isString = _interopRequire(require("lodash/isString"));

var AssetsCallBuilder = require("./assets_call_builder").AssetsCallBuilder;

var CommissionCallBuilder = require("./commission_call_builder").CommissionCallBuilder;

var AccountTraitsCallBuilder = require("./account_traits_call_builder").AccountTraitsCallBuilder;

var querystring = require("querystring");
var axios = require("axios");
var toBluebird = require("bluebird").resolve;
var URI = require("urijs");
var URITemplate = require("urijs").URITemplate;

var SUBMIT_TRANSACTION_TIMEOUT = 20 * 1000;

exports.SUBMIT_TRANSACTION_TIMEOUT = SUBMIT_TRANSACTION_TIMEOUT;

var Server = exports.Server = (function () {
    /**
     * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
     * instance and exposes an interface for requests to that instance.
     * @constructor
     * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`). The old method (config object parameter) is **deprecated**.
     */

    function Server() {
        var serverURL = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Server);

        if (isString(serverURL)) {
            this.serverURL = URI(serverURL);
        } else {
            // We leave the old method for compatibility reasons.
            // This will be removed in the next major release.
            this.protocol = serverURL.secure ? "https" : "http";
            this.hostname = serverURL.hostname || "localhost";
            this.port = serverURL.port || 3000;
            this.serverURL = URI({ protocol: this.protocol,
                hostname: this.hostname,
                port: this.port });
        }
    }

    _createClass(Server, {
        submitTransaction: {

            /**
             * Submits a transaction to the network.
             * @see [Post Transaction](https://www.stellar.org/developers/horizon/reference/transactions-create.html)
             * @param {Transaction} transaction - The transaction to submit.
             * @returns {Promise} Promise that resolves or rejects with response from horizon.
             */

            value: function submitTransaction(transaction) {
                var tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
                var promise = axios.post(URI(this.serverURL).path("transactions").toString(), "tx=" + tx, { timeout: SUBMIT_TRANSACTION_TIMEOUT }).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        accounts: {

            /**
             * Returns new {@link AccountCallBuilder} object configured by a current Horizon server configuration.
             * @returns {AccountCallBuilder}
             */

            value: function accounts() {
                return new AccountCallBuilder(URI(this.serverURL));
            }
        },
        ledgers: {

            /**
             * Returns new {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
             * @returns {LedgerCallBuilder}
             */

            value: function ledgers() {
                return new LedgerCallBuilder(URI(this.serverURL));
            }
        },
        transactions: {

            /**
             * Returns new {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
             * @returns {TransactionCallBuilder}
             */

            value: function transactions() {
                return new TransactionCallBuilder(URI(this.serverURL));
            }
        },
        offers: {

            /**
             * People on the Stellar network can make offers to buy or sell assets. This endpoint represents all the offers a particular account makes.
             * Currently this method only supports querying offers for account and should be used like this:
             * ```
             * server.offers('accounts', accountId)
             *  .then(function(offers) {
             *    console.log(offers);
             *  });
             * ```
             * @param {string} resource Resource to query offers
             * @param {...string} resourceParams Parameters for selected resource
             * @returns OfferCallBuilder
             */

            value: function offers(resource) {
                for (var _len = arguments.length, resourceParams = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    resourceParams[_key - 1] = arguments[_key];
                }

                return _applyConstructor(OfferCallBuilder, [URI(this.serverURL), resource].concat(resourceParams));
            }
        },
        orderbook: {

            /**
             * Returns new {@link OrderbookCallBuilder} object configured by a current Horizon server configuration.
             * @param {Asset} selling Asset being sold
             * @param {Asset} buying Asset being bought
             * @returns {OrderbookCallBuilder}
             */

            value: function orderbook(selling, buying) {
                return new OrderbookCallBuilder(URI(this.serverURL), selling, buying);
            }
        },
        operations: {

            /**
             * Returns new {@link OperationCallBuilder} object configured by a current Horizon server configuration.
             * @returns {OperationCallBuilder}
             */

            value: function operations() {
                return new OperationCallBuilder(URI(this.serverURL));
            }
        },
        paths: {

            /**
             * The Stellar Network allows payments to be made between assets through path payments. A path payment specifies a
             * series of assets to route a payment through, from source asset (the asset debited from the payer) to destination
             * asset (the asset credited to the payee).
             *
             * A path search is specified using:
             *
             * * The destination address
             * * The source address
             * * The asset and amount that the destination account should receive
             *
             * As part of the search, horizon will load a list of assets available to the source address and will find any
             * payment paths from those source assets to the desired destination asset. The search's amount parameter will be
             * used to determine if there a given path can satisfy a payment of the desired amount.
             *
             * Returns new {@link PathCallBuilder} object configured with the current Horizon server configuration.
             *
             * @param {string} source The sender's account ID. Any returned path will use a source that the sender can hold.
             * @param {string} destination The destination account ID that any returned path should use.
             * @param {Asset} destinationAsset The destination asset.
             * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
             * @returns {@link PathCallBuilder}
             */

            value: function paths(source, destination, destinationAsset, destinationAmount) {
                return new PathCallBuilder(URI(this.serverURL), source, destination, destinationAsset, destinationAmount);
            }
        },
        payments: {

            /**
             * Returns new {@link PaymentCallBuilder} object configured with the current Horizon server configuration.
             * @returns {PaymentCallBuilder}
             */

            value: function payments() {
                return new PaymentCallBuilder(URI(this.serverURL));
            }
        },
        effects: {

            /**
             * Returns new {@link EffectCallBuilder} object configured with the current Horizon server configuration.
             * @returns {EffectCallBuilder}
             */

            value: function effects() {
                return new EffectCallBuilder(URI(this.serverURL));
            }
        },
        commission: {
            value: function commission() {
                return new CommissionCallBuilder(URI(this.serverURL));
            }
        },
        assets: {

            /**
             * Returns new {@link AssetsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {AssetsCallBuilder}
             */

            value: function assets() {
                return new AssetsCallBuilder(URI(this.serverURL));
            }
        },
        accountTraits: {

            /**
             * Returns new {@link AccountTraitsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {AccountTraitsCallBuilder}
             */

            value: function accountTraits() {
                return new AccountTraitsCallBuilder(URI(this.serverURL));
            }
        },
        _setAccountOptions: {
            value: function _setAccountOptions(endpoint, options, keypair) {
                var timestamp = Math.floor(new Date().getTime() / 1000).toString();

                var dataStr = querystring.stringify(options);
                var signatureBase = "{method: 'post', body: '" + dataStr + "', timestamp: '" + timestamp + "'}";
                var data = hash(signatureBase);
                // console.log("signatureData: ", data);
                var signature = keypair.signDecorated(data);

                var config = {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-AuthTimestamp": timestamp.toString(),
                        "X-AuthPublicKey": keypair.accountId(),
                        "X-AuthSignature": signature.toXDR("base64")
                    },
                    timeout: SUBMIT_TRANSACTION_TIMEOUT };
                var promise = axios.post(URI(this.serverURL).path(endpoint).toString(), dataStr, config).then(function (response) {
                    return response.data;
                })["catch"](this._handleError);
                return toBluebird(promise);
            }
        },
        _handleError: {
            value: function _handleError(response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    switch (response.status) {
                        case 400:
                            return Promise.reject(new BadRequestError(response.data, response));
                        case 404:
                            return Promise.reject(new NotFoundError(response.data, response));
                        default:
                            return Promise.reject(new NetworkError(response.status, response));
                    }
                }
            }
        },
        restrictAgentAccount: {
            value: function restrictAgentAccount(accountId, block_outcoming, block_incoming, signer, bankMasterAccountId) {
                var self = this;
                return self.loadAccount(bankMasterAccountId).then(function (source) {
                    console.log("Creating restriction");
                    var op = StellarSdk.Operation.restrictAgentAccount(accountId, block_outcoming, block_incoming);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(signer);
                    return self.submitTransaction(tx);
                });
                // var restrictions = {block_incoming_payments: block_incoming, block_outcoming_payments: block_outcoming};
                // var encodedAccId = encodeURIComponent(accountId);
                // return this._setAccountOptions('accounts/'+encodedAccId+'/traits', restrictions, keypair);
            }
        },
        setAgentLimits: {
            value: function setAgentLimits(accountId, asset_code, limit, signer, bankMasterAccountId) {
                var self = this;
                return self.loadAccount(bankMasterAccountId).then(function (source) {
                    console.log("Creating limits");
                    var op = StellarSdk.Operation.setAgentLimits(accountId, asset_code, limit);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(signer);
                    return self.submitTransaction(tx);
                });
                // var limits = {
                //     asset_code: asset_code,
                //     max_operation_out: isNaN(limit.max_operation_out)? -1 : limit.max_operation_out,
                //     daily_max_out: isNaN(limit.daily_max_out)? -1 : limit.daily_max_out,
                //     monthly_max_out: isNaN(limit.monthly_max_out)? -1 : limit.monthly_max_out,
                //     max_operation_in: isNaN(limit.max_operation_in)? -1 : limit.max_operation_in,
                //     daily_max_in: isNaN(limit.daily_max_in)? -1 : limit.daily_max_in,
                //     monthly_max_in: isNaN(limit.monthly_max_in)? -1 : limit.monthly_max_in
                // };
                // var encodedAccId = encodeURIComponent(accountId);
                // return this._setAccountOptions('accounts/'+encodedAccId+'/limits', limits, keypair);
            }
        },
        setCommission: {

            /**
            * Creates or update commission object
            * @param {object} opts
            * @param {string} [opts.from] source of operations 
            * @param {string} [opts.to] destination of operation
            * @param {int} [opts.from_type] source account type
            * @param {int} [opts.to_type] destination type
            * @param {Asset} [opts.asset] - The asset of commission
            * @param {int64} flat_fee - flat fee ("12.5")
            * @param {int64} percent_fee - percent fee defined as ("3.5")%
            * @param {keypair} keypair - to sign request
            * @returns {Promise} Returns a promise to the error if failed to set commission
            */

            value: function setCommission(opts, flat_fee, percent_fee, signer, bankMasterAccountId) {
                var self = this;
                return self.loadAccount(bankMasterAccountId).then(function (source) {
                    console.log("Creating commission");
                    var op = StellarSdk.Operation.setCommission(opts, flat_fee, percent_fee);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(signer);
                    return self.submitTransaction(tx);
                });
            }
        },
        deleteCommission: {

            /**
             * Deletes commission
             * @param {object} opts
             * @param {string} [opts.from] source of operations 
             * @param {string} [opts.to] destination of operation
             * @param {int} [opts.from_type] source account type
             * @param {int} [opts.to_type] destination type
             * @param {Asset} [opts.asset] - The asset of commission
             * @param {keypair} keypair - to sign request
             */

            value: function deleteCommission(opts, signer, bankMasterAccountId) {
                var self = this;
                return self.loadAccount(bankMasterAccountId).then(function (source) {
                    console.log("Deleting commission");
                    var op = StellarSdk.Operation.deleteCommission(opts);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(signer);
                    return self.submitTransaction(tx);
                });
            }
        },
        manageAsset: {
            value: function manageAsset(asset, isAnonymous, isDelete, signer, bankMasterAccountId) {
                var self = this;
                return self.loadAccount(bankMasterAccountId).then(function (source) {
                    console.log("Managing asset");
                    var op = StellarSdk.Operation.manageAssets(asset, isAnonymous, isDelete);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(signer);
                    return self.submitTransaction(tx);
                });
            }
        },
        friendbot: {

            /**
             * Returns new {@link FriendbotBuilder} object configured with the current Horizon server configuration.
             * @returns {FriendbotBuilder}
             * @private
             */

            value: function friendbot(address) {
                return new FriendbotBuilder(URI(this.serverURL), address);
            }
        },
        loadAccount: {

            /**
            * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
            * @param {string} accountId - The account to load.
            * @returns {Promise} Returns a promise to the {@link Account} object with the sequence number populated.
            */

            value: function loadAccount(accountId) {
                return this.accounts().accountId(accountId).call().then(function (res) {
                    return new Account(accountId, res.sequence);
                });
            }
        },
        getBalances: {

            /**
             * Get balances for given accounts sorted by asset
             * @param accountList {Array} Array of AccountId
             * @returns {Promise}
             */

            value: function getBalances(accountList) {
                var response = axios.post(URI(this.serverURL).path("balances").toString(), querystring.stringify({ multi_accounts: JSON.stringify(accountList) })).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(response);
            }
        },
        getPayments: {

            /**
             * Get payments history for given accounts
             * @param request {Object}
             * @returns {Promise}
             */

            value: function getPayments(request) {
                var response = axios.post(URI(this.serverURL).path("payments").toString(), querystring.stringify(request)).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(response);
            }
        }
    });

    return Server;
})();