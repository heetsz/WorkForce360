import { Schema, model } from "mongoose"
const hrSchema = new Schema({
      name: {
            type: String,
      },
      email: {
            type: String,
            unique: true,
            required: true,
      },

      password: {
            type: String,
            required: true
      },

})
const hr = model('hr', hrSchema)
export default hr;