const { Schema, model, SchemaTypes } = require('mongoose');

const schema = Schema({
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
    },
    question: {
        type: Object
    },
    dateCreated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    },
    dateUpdated: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



// 3. Create a Model.
const answerModel = model('Answer', schema);
module.exports = answerModel;