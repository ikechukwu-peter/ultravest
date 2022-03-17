const { Schema, model, SchemaTypes } = require('mongoose');

const schema = Schema({
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
    },
    question: {
        type: String,
        required: true,
    },
    options: [
        {
            type: String,
            required: true,
        }
    ]


},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



// 3. Create a Model.
const questionModel = model('Question', schema);
module.exports = questionModel;