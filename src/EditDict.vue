<template>
  <div id="edit-dictionary">
    <h4>Editing dictionary <em>{{ item.name }}</em></h4>
    <p v-if="fetching">Fetching items...</p>
    <div id="dictionary-items" v-else>
      <p><em>Total records:</em> {{ items.length }}</p>

      <table :class="tableClass">
        <thead>
          <tr>
            <th class="manage-column column-primary">Key</th>
            <th class="manage-column">Value</th>
            <th class="manage-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in items" :key="i.item_key">
            <td class="column-primary" data-colname="Key">{{ i.item_key }}</td>
            <td data-colname="Value">{{ i.item_value }}</td>
            <td data-colname="Actions">
              <button class="button button-danger" :class="cms" type="button" @click="removeItem(i.item_key)">Delete</button>
              <button class="button" :class="cms" type="button" @click="edit(i.item_key)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <button class="button" :class="cms" type="button" @click="add">Add</button>
      </p>

      <div id="dict-updates" class="update-list" :class="cms" v-if="actions.length > 0">
        <h5>Updates to make:</h5>
        <ol>
          <li v-for="(action, idx) in actions" :key="idx">
            <span>{{ action.op.toUpperCase() }} item "{{ action.item_key }}" {{ 'item_value' in action ? ` with value "${action.item_value}"` : '' }}</span>
            <button class="button" :class="cms" type="button" @click="removeAction(idx)">Remove</button>
          </li>
        </ol>
      </div>
    </div>

    <p>
      <button class="button button--primary button-primary" :class="cms" type="button" @click="save" v-if="actions.length > 0">{{ working ? workingText : saveAllText }}</button>
      <button class="button" :class="cms" type="button" @click="cancelEdit">Cancel</button>
    </p>
  </div>
</template>

<script>
export default {
  name: 'edit-dictionary',
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
    }
  },
  methods: {
    cancelEdit: function() {
      this.$emit('switch-stage', {
        stage: 'AclDictList',
        type: 'dict',
      });
    },
    edit: function(key) {
      const newValue = prompt(`Enter the new value for key ${key}:`);
      if (newValue) {
        this.actions.push({
          op: 'update',
          item_key: key,
          item_value: newValue
        })
      }
    },
    removeItem: function(key) {
      this.actions.push({
        op: 'delete',
        item_key: key,
      });
    },
    add: function() {
      const newKey = prompt('Enter a new key:');
      const action = {
        op: 'upsert',
        item_key: '',
        item_value: '',
      };
      if (newKey) {
        action.item_key = newKey;
        const newValue = prompt('Enter a value:');
        if (newValue) {
          action.item_value = newValue;
          this.actions.push(action);
          return;
        }
      }
    },
    removeAction: function (index) {
      this.$delete(this.actions, index);
    },
    save: async function() {
      if (this.actions.length > 0) {
        this.working = true;
        const payload = {
          items: this.actions
        };
        const resp = await this.$api.request(`/dictionaries/${this.item.id}/items`, {
          method: 'PATCH',
          headers: {
            agcdn_mgmt_api_key: this.apiKey
          },
          data: payload
        });
        this.working = false;
        if (resp.data.status == 'ok') {
          this.$emit('switch-stage', {
            stage: 'AclDictList',
            type: 'dict',
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
    this.$api.request(`/dictionaries/${this.item.id}/items`, {
      method: 'GET',
      headers: {
        agcdn_mgmt_api_key: this.apiKey,
      }
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
