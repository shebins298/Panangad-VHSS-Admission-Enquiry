document.addEventListener('DOMContentLoaded', function () {
  // Initialize Firebase Firestore and Authentication
  const db = firebase.firestore();
  const auth = firebase.auth();

  // Check if the user is authenticated and has the 'admin' role
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is logged in, now check the 'admin' field in the user document
      db.collection("users").doc(user.uid).get().then((doc) => {
        if (doc.exists && doc.data().admin) {
          // User is an admin, fetch the enquiries
          fetchEnquiries();
        } else {
          // If not an admin, redirect them to another page (e.g., home page or login page)
          window.location.replace("https://www.panangadvhss.com"); // Replace with your redirect URL
        }
      }).catch((error) => {
        console.error("Error checking admin status: ", error);
      });
    } else {
      // No user is logged in, redirect to login page
      window.location.replace("https://www.panangadvhss.com/login"); // Replace with your login URL
    }
  });

  // Fetch and display all enquiries
  function fetchEnquiries() {
    db.collection("enquiries")
      .get()
      .then((querySnapshot) => {
        const tableBody = document.getElementById("enquiriesTable").getElementsByTagName('tbody')[0];
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
});
