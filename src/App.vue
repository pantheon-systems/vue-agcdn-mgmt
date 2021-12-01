<template>
  <div id="admin-area">
    <p v-if="!agcdn_mgmt_api_key">Please enter an API key above to begin.</p>

    <div id="cache" class="admin-area-section" :class="cms" v-if="agcdn_mgmt_api_key">
      <h3>Cache Purge</h3>
      <p><button type="button" :class="cms" class="button button--primary button-primary" @click="purgeAll">{{ purging ? "Purging..." : "Purge All Cache" }}</button></p>
    </div>

    <div id="dictionaries" class="admin-area-section" :class="cms" v-if="agcdn_mgmt_api_key">
      <h3>Dictionaries</h3>
      <p v-if="dictsLoading">Loading list...</p>
      <div class="dictionaryWrapper" v-else>
        <p v-if="dictLoadingError"><strong>Error loading dictionaries. Reload the page to try again, or contact Pantheon Technical Services.</strong></p>
        <keep-alive v-else>
          <component
            v-bind:is="dictStage"
            hash-type="dict"
            :item="dictStage == 'AclDictList'
              ? dicts
              : dictToEdit"
            :api-key="agcdn_mgmt_api_key"
            :cms="cms"
            @switch-stage="switchStage"
            @refresh-list="refresh"
          ></component>
        </keep-alive>
      </div>
    </div>

    <div id="acls" class="admin-area-section" :class="cms" v-if="agcdn_mgmt_api_key && submodule !== 'settings'">
      <h3>ACLs</h3>
      <p v-if="aclsLoading">Loading list...</p>
      <div class="aclWrapper" v-else>
        <p v-if="aclLoadingError"><strong>Error loading ACLs. Reload the page to try again, or contact Pantheon Technical Services.</strong></p>
        <keep-alive v-else>
          <component
            v-bind:is="aclStage"
            hash-type="acl"
            :item="aclStage == 'AclDictList'
              ? acls
              : aclToEdit"
            :api-key="agcdn_mgmt_api_key"
            :cms="cms"
            @switch-stage="switchStage"
            @refresh-list="refresh"
          ></component>
        </keep-alive>
      </div>
    </div>

  </div>
</template>

<script>
import './main.scss';
import EditAcl from './EditAcl.vue';
import EditDict from './EditDict.vue';
import AclDictList from './AclDictList.vue';

export default {
  name: 'admin-area',
  components: {
    EditAcl,
    EditDict,
    AclDictList,
  },
  data() {
    return {
      agcdn_mgmt_api_key: 'WP_OPTIONS' in window
        ? window.WP_OPTIONS.pantheon_agcdn_management_api_key
        : window.drupalSettings.pantheon_agcdn_management.api_key,
      dictsLoading: true,
      aclsLoading: true,
      dicts: [],
      acls: [],
      dictStage: 'AclDictList',
      aclStage: 'AclDictList',
      dictIdToEdit: '',
      aclIdToEdit: '',
      dictLoadingError: false,
      aclLoadingError: false,
      purging: false,
      purgeUrl: '',
      submodule: 'WP_OPTIONS' in window
        ? window.WP_OPTIONS.pantheon_agcdn_management_submodule
        : window.drupalSettings.pantheon_agcdn_management.submodule,
    }
  },
  methods: {
    switchStage: function(ctx) {
      this.$set(this, `${ctx.type}Stage`, ctx.stage);
      if (/^Edit/.test(ctx.stage)) {
        this.$set(this, `${ctx.type}IdToEdit`, ctx.id);
      } else {
        this.$set(this, `${ctx.type}IdToEdit`, '');
      }
    },
    refresh: function(ctx) {
      if (ctx.type === 'dict') {
        this.dictsLoading = true;
        this.dicts = [];
        this.filteredDicts = [];
        this.getDictionaries();
      } else if (ctx.type === 'acl') {
        this.aclsLoading = true;
        this.acls = [];
        this.filteredACLs = [];
        this.getACLs();
      }
    },
    getDictionaries: function() {
      const options = {
        method: 'GET',
        headers: { agcdn_mgmt_api_key: this.agcdn_mgmt_api_key }
      };
      this.$api.request('/dictionaries', options).then(res => {
        this.dictsLoading = false;
        this.dicts = res.data;
        this.filteredDicts = this.dicts;
      }).catch(e => {
        this.dictsLoading = false;
        this.dictLoadingError = true;
      });
    },
    getACLs: function() {
      const options = {
        method: 'GET',
        headers: { agcdn_mgmt_api_key: this.agcdn_mgmt_api_key }
      };
      this.$api.request('/acls', options).then(res => {
        this.aclsLoading = false;
        this.acls = res.data.filter(a => a.name !== "waf allowlist");
        this.filteredACLs = this.acls;
      }).catch(e => {
        this.aclsLoading = false;
        this.aclLoadingError = true;
      });
    },
    purgeAll: async function() {
      this.purging = true;
      const purgeResponse = await this.$api.request('/purge/all', {
        method: 'GET',
        headers: {
          agcdn_mgmt_api_key: this.agcdn_mgmt_api_key,
        },
      });
      if (purgeResponse.data.status !== 'ok') {
        alert('Failed to purge cache.');
      }
      this.purging = false;
    },
  },
  mounted() {
    // Don't do these synchronously so that both calls can be issued at the same time.
    if (this.agcdn_mgmt_api_key) {
      this.getDictionaries();
      this.getACLs();
    }
  },
  computed: {
    dictToEdit: function() {
      return this.dicts.filter(d => d.id === this.dictIdToEdit)[0];
    },
    aclToEdit: function() {
      return this.acls.filter(a => a.id === this.aclIdToEdit)[0];
    },
    cms: function() {
      return 'WP_OPTIONS' in window ? 'wp' : 'drupal';
    },
  },
}
</script>
