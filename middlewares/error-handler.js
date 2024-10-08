module.exports = (error, req, res, next) => {
  console.error(error); // Log the error to the console.
  console.log(req.flash); // Check the current flash messages.

  // Set an error flash message to display to the user, defaulting if not provided.
  req.flash('error', error.errorMessage || '處理失敗:(');

  res.redirect('back'); // Redirect the user back to the previous page.

  // The purpose of next(error) is to pass the error to the next error-handling middleware.
  // If there are no other error-handling middleware or routes, 
  // Express will use the default error-handling mechanism to respond to the error.
  next(error);
};
