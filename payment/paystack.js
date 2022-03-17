const paystack = (request) => {
    const MySecretKey = 'Bearer sk_test_xxxx';
    // sk_test_xxxx to be replaced by your own secret key
   const initializePayment = (form, mycallback) =>{
   }
   const verifyPayment = (ref,mycallback) => {
   }
   return {initializePayment, verifyPayment};
}