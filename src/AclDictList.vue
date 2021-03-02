<template>
  <div class="aclDictList">
    <p>
      <label v-bind:for="`${this.hashType}Filter`">Search {{ pluralType }} by name:</label>
      <input type="text" id="filter" v-model="filter" @input="filterList">
    </p>
    <p>
      <button type="button" class="button button--primary button-primary" :class="cms" @click="refresh">Refresh List</button>
    </p>
    <table :class="tableClass">
      <thead>
        <tr>
          <th class="manage-column column-primary">Name</th>
          <th class="manage-column">ID</th>
          <th class="manage-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in filteredList" :key="i.id">
          <td>{{ i.name }}</td>
          <td>{{ i.id }}</td>
          <td>
            <button type="button" class="button" :class="cms" @click="editItem(i.id)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p>Just for kicks</p>
  </div>
</template>

<script>
export default {
  name: 'acl-dict-list',
  props: {
    item: Array,
    hashType: String,
    cms: String,
  },
  data() {
    return {
      filteredList: [],
      filter: '',
    };
  },
  methods: {
    filterList: function() {
      if (this.filter === '') {
        this.filteredList = this.item;
      } else {
        this.filteredList = this.item.filter(i => i.name.includes(this.filter));
      }
    },
    editItem: function(id) {
      this.$emit('switch-stage', {
        stage: `Edit${this.hashType.charAt(0).toUpperCase() + this.hashType.substr(1)}`,
        type: this.hashType,
        id,
      });
    },
    refresh: function() {
      this.$emit('refresh-list', {
        type: this.hashType,
      });
    },
  },
  mounted() {
    this.filteredList = this.item;
  },
  computed: {
    pluralType: function() {
      return this.hashType === 'acl'
        ? 'ACLs'
        : 'dictionaries';
    },
    tableClass: function() {
      return this.cms === 'wp'
        ? 'wp-list-table widefat fixed striped'
        : '';
    },
  },
}
</script>
