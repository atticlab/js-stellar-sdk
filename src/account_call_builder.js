import {CallBuilder} from "./call_builder";

export class AccountCallBuilder extends CallBuilder {
    /**
     * Creates a new {@link AccountCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#accounts}.
     * @see [All Accounts](https://www.stellar.org/developers/horizon/reference/accounts-all.html)
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('accounts');
    }

    /**
     * Returns information and links relating to a single account.
     * The balances section in the returned JSON will also list all the trust lines this account has set up.
     *
     * @deprecated use accountId method instead
     */
    address(id) {
        console.warn("AccountCallBuilder#address is deprecated, please use AccountCallBuilder#accountId instead");
        return this.accountId(id);
    }

    /**
     * Returns information and links relating to a single account.
     * The balances section in the returned JSON will also list all the trust lines this account has set up.
     *
     * @see [Account Details](https://www.stellar.org/developers/horizon/reference/accounts-single.html)
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AccountCallBuilder}
     */
    accountId(id) {
      this.filter.push(['accounts', id]);
      return this;
    }
    
    /**
     * Returns detailed income/outcome statistics relating to a single account.
     *
     * @see [Account Details] TODO: link to reference
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AccountCallBuilder}
     */
    statisticsForAccount(id) {
      this.filter.push(['accounts', id, "statistics"]);
      return this;
    }

    /**
     * Returns limits relating to a single account.
     *
     * @see [Account Details] TODO: link to reference
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AccountCallBuilder}
     */
    limits(id){
      this.filter.push(['accounts', id, "limits"]);
      return this;

    }

    /**
     * Returns restrictions relating to a single account.
     *
     * @see [Account Details] TODO: link to reference
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AccountCallBuilder}
     */
    traits(id){
        this.filter.push(['accounts', id, "traits"]);
        return this;

    }
}
