
let updateOne = (Model) => async (req, res) => {

  const doc = await Model.findByIdAndUpdate(req.params.userId, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    res.status(404).json({
      status: "fail",
      message: "No document found",
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
}

let createOne = (Model) => async (req, res) => {
  const doc = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
};




let deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "No document found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong, try again",
    });
  }
};

let getOne = (Model) => async (req, res) => {
  console.log(req.params.userId)
  try {
    const doc = await Model.findById(req.params.userId).populate("profile")

    console.log(doc)

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "No document found with that ID",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (error) {
    console.log(error)
    if (error.name == "CastError") {
      return res.status(400).json({
        status: "fail",
        error: 'invalid parameter'
      })
    } else {
      return res.status(500).json({
        status: "fail",
        error: 'Something went wrong, please try again'
      })
    }
  }
};

let getAll = (Model) => async (req, res) => {
  try {
    const doc = await Model.find({ "role": { $ne: "admin" } }).populate("profile");

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  } catch (error) {
    if (err.name == "CastError") {
      return res.status(400).json({
        status: "fail",
        error: 'invalid parameter'
      })
    } else {
      res.status(500).json({
        status: "fail",
        error: 'Something went wrong, please try again'
      })
    }
  }
};

module.exports = {
  createOne, updateOne, deleteOne, getOne, getAll
}
