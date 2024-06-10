class viewUserSchema extends Schema {
  /**
     * @param {string} user_id - The user ID
     * @param {string} display_name - The display name
     */

  constructor(user_id, display_name) {
    this.user_id = user_id;
    this.display_name = display_name;
}
}