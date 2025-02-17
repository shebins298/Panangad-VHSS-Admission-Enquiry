document.addEventListener("DOMContentLoaded", function () {
  const adminContainer = document.querySelector(".admin-container");
  const originalContent = adminContainer.innerHTML;
  
 firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      console.log("User logged in:", user.uid);
      const userRef = db.collection("user").doc(user.uid);
      try {
        const doc = await userRef.get();
        if (!doc.exists || doc.data().admin !== true) {
          console.warn("Not an admin or admin data missing:", doc.data());
          await firebase.auth().signOut();
          window.location.href = "login.html";
        } else {
          console.log("Admin verified. Loading panel...");
          // Restore original admin panel content
          adminContainer.innerHTML = originalContent;
          attachSignOutListener();
          fetchEnquiries();
        }
      } catch (error) {
        console.error("Error verifying admin:", error);
        await firebase.auth().signOut();
        window.location.href = "login.html";
      }
    } else {
      console.warn("No user logged in.");
      window.location.href = "login.html";
    }
  });
  
  // Fetch and display all enquiries
  function fetchEnquiries() {
    db.collection("enquiries")
      .get()
      .then((querySnapshot) => {
        const tableBody = document.getElementById("enquiriesTable").getElementsByTagName('tbody')[0];
        if (tableBody) {
          tableBody.innerHTML = ""; // Clear the table before adding new data

          querySnapshot.forEach((doc) => {
            const enquiry = doc.data();
            const row = tableBody.insertRow();
            row.setAttribute("data-id", doc.id); // Store document ID in the row

            row.innerHTML = `
              <td>${enquiry.studentName}</td>
              <td>${enquiry.classApplying}</td>
              <td>${enquiry.parentName}</td>
              <td>${enquiry.phone}</td>
              <td>
                <button class="editBtn" onclick="editEnquiry('${doc.id}')">Edit</button>
                <button class="deleteBtn" onclick="deleteEnquiry('${doc.id}')">Delete</button>
              </td>
            `;
          });
        }
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
      });
  }

  // Function to edit an enquiry
  function editEnquiry(enquiryId) {
    const enquiryRef = db.collection("enquiries").doc(enquiryId);

    enquiryRef.get().then((doc) => {
      if (doc.exists) {
        const enquiry = doc.data();

        // Prompt the admin to edit the details
        const newStudentName = prompt("Edit Student Name", enquiry.studentName);
        const newClassApplying = prompt("Edit Class Applying For", enquiry.classApplying);
        const newParentName = prompt("Edit Parent's Name", enquiry.parentName);
        const newPhone = prompt("Edit Parent's Phone Number", enquiry.phone);

        if (newStudentName && newClassApplying && newParentName && newPhone) {
          enquiryRef.update({
            studentName: newStudentName,
            classApplying: newClassApplying,
            parentName: newParentName,
            phone: newPhone,
          }).then(() => {
            alert("Enquiry updated successfully.");
            fetchEnquiries(); // Refresh the enquiries list
          }).catch((error) => {
            console.error("Error updating document: ", error);
          });
        }
      } else {
        alert("Enquiry not found.");
      }
    });
  }

  // Function to delete an enquiry
  function deleteEnquiry(enquiryId) {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      db.collection("enquiries").doc(enquiryId).delete()
        .then(() => {
          alert("Enquiry deleted successfully.");
          fetchEnquiries(); // Refresh the enquiries list
        })
        .catch((error) => {
          console.error("Error deleting document: ", error);
        });
    }
  }

  // Firebase Authentication - Login/Logout Handlers (Optional)
  function login() {
    const phoneNumber = prompt("Enter phone number for login:");
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
      .then((confirmationResult) => {
        const code = prompt("Enter the verification code sent to your phone:");
        return confirmationResult.confirm(code);
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  }

  function logout() {
    firebase.auth().signOut().then(() => {
      window.location.replace("https://www.panangadvhss.com/login"); // Redirect to login page
    });
  }
});
