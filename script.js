// script.js
document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const studentName = document.getElementById("name").value;
  const classApplying = document.getElementById("class").value;
  const parentName = document.getElementById("parent").value;
  const phone = document.getElementById("phone").value;

  // Save to Firestore with a server timestamp
  db.collection("enquiries")
    .add({
      studentName: studentName,
      classApplying: classApplying,
      parentName: parentName,
      phone: phone,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      // Replace the form with a thank you message
      document.querySelector(".form-container").innerHTML = `
        <h2>Thank You!</h2>
        <p>Thank you for submitting your enquiry. We will get back to you soon.</p>
      `;
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      alert("There was an error submitting your enquiry. Please try again.");
    });
});
