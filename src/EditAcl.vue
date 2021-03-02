<template>
  <div id="edit-acl">
    <h4>Editing ACL <em>{{ item.name }}</em></h4>
    <p v-if="fetching">Fetching items...</p>
    <div id="acl-items" v-else>
      <p><em>Total records:</em> {{ items.length }}</p>

      <table :class="tableClass">
        <thead>
          <tr>
            <th class="manage-column column-primary">IP</th>
            <th class="manage-column">Subnet</th>
            <th class="manage-column">Comment</th>
            <th class="manage-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in items" :key="i.id">
            <td class="column-primary" data-colname="IP">{{ i.ip }}</td>
            <td data-colname="Subnet">{{ i.subnet }}</td>
            <td data-colname="Comment">{{ i.comment }}</td>
            <td data-colname="Actions">
              <button class="button button-danger" :class="cms" type="button" @click="removeItem(i)">Delete</button>
              <button class="button" :class="cms" type="button" @click="edit(i.id)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p><button class="button" type="button" @click="add">Add</button></p>

      <div id="acl-updates" class="update-list" :class="cms" v-if="actions.length > 0">
        <h5>Updates to make:</h5>
        <ol>
          <li v-for="(action, idx) in actions" :key="idx">
            <span>{{ action.op.toUpperCase() }} IP "{{ action.ip }}/{{ action.subnet }}"</span>
            <button type="button" class="button" :class="cms" @click="removeAction(idx)">Remove</button>
          </li>
        </ol>
      </div>
    </div>

    <p>
      <button type="button" class="button button--primary button-primary" :class="cms" @click="save" v-if="actions.length > 0">{{ working ? workingText : saveAllText }}</button>
      <button type="button" class="button" :class="cms" @click="cancelEdit">Cancel</button>
    </p>
  </div>
</template>

<script>
export default {
  name: 'edit-acl',
  props: {
    item: Object,
    apiKey: String,
    cms: String,
  },
  data() {
    return {
      items: [],
      fetching: true,
      working: false,
      actions: [],
      saveAllText: 'Save All Changes',
      workingText: 'Working...',
    };
  },
  methods: {
    cancelEdit: function() {
      this.$emit('switch-stage', {
        stage: 'AclDictList',
        type: 'acl',
      });
    },
    edit: function(id) {
      const newIP = prompt(`Enter the new IP address:`);
      if (newIP) {
        const newSubnet = prompt(`Enter the new subnet (leave blank for /32):`);
        const comment = prompt('Enter an optional comment:');
        this.actions.push({
          op: 'update',
          id,
          ip: newIP,
          subnet: newSubnet || 32,
          comment,
        });
      }
    },
    removeItem: function(item) {
      this.actions.push({
        op: 'delete',
        id: item.id,
        ip: item.ip,
        subnet: item.subnet,
      });
    },
    add: function() {
      const newIP = prompt('Enter the new IP address:');
      const action = {
        op: 'create',
        ip: '',
        subnet: '',
        comment: ''
      };
      if (newIP) {
        // see if that IP is already in there and if so, change to update
        const check = this.items.filter(i => i.ip === newIP);
        if (check.length > 0) {
          action.op = 'update';
          action.id = check[0].id;
        }
        action.ip = newIP;
        const newSubnet = prompt('Enter the new subnet (leave blank for /32):');
        const comment = prompt('Enter an optional comment:');
        action.subnet = newSubnet || 32;
        action.comment = comment;
        this.actions.push(action);
      }
    },
    removeAction: function(index) {
      this.$delete(this.actions, index);
    },
    save: async function() {
      if (this.actions.length > 0) {
        this.working = true;
        const payload = {
          entries: this.actions
        };
        const resp = await this.$api.request(`/acls/${this.item.id}/entries`, {
          method: 'PATCH',
          headers: {
            agcdn_mgmt_api_key: this.apiKey,
          },
          data: payload,
        });
        this.working = false;
        if (resp.data.status == "ok") {
          this.$emit('switch-stage', {
            stage: 'AclDictList',
            type: 'acl',
          });
        } else {
          this.actions = [];
          alert('Your actions have not been saved. Please try again later.');
        }
      }
    },
  },
  activated() {
    this.fetching = true;
    this.$api.request(`/acls/${this.item.id}/entries`, {
      method: 'GET',
      headers: {
        agcdn_mgmt_api_key: this.apiKey,
      },
    }).then(items => {
      this.items = items.data;
      this.actions = [];
      this.fetching = false;
    });
  },
  computed: {
    tableClass: function() {
      return this.cms === 'wp'
        ? 'wp-list-table widefat fixed striped'
        : '';
    },
  },
}
</script>
