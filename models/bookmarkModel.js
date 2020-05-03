const mongoose = require('mongoose');


const bookmSchema = mongoose.Schema({
    id:{
        type: String
    },
    title:{
        type: String
    },
    description:
    {
        type: String
    },
    url:
    {
        type: String
    },
    rating:
    {
        type: Number
    }
});

const bookmsCollection = mongoose.model('bookms', bookmSchema);

const Bookms = {
    createBookm : function(newBookm)
    {
        return bookmsCollection
            .create(newBookm)
            .then(createdBookm => {
                return createdBookm;
            })
            .catch(e => {
                return new Error(e)
            });
    },
    getAllBookms : function()
    {
        return bookmsCollection
            .find()
            .then(allBookms => {
                return allBookms;
            })
            .catch(e => {
                return e;
            });
    },
    getBookm : function(title)
    {
        return bookmsCollection
        .find({title: title})
        .then(titleBookm => {
            return titleBookm;
        })
        .catch(e => {
            return e;
        });
    },
    deleteBookm : function(id)
    {
        return bookmsCollection
        .deleteOne({id: id})
        .then(results => {
            return results;
        })
        .catch(e => {
            return e;
        });
    },
    updateBookm : function(id, update)
    {
        return bookmsCollection
        .updateOne({id: id}, {$set: update})
        .then(results => {
            return results;
        })
        .catch( e => {
            return e;
        });
    }
}

module.exports = {Bookms};