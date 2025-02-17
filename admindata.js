// Check if user is authenticated and an admin
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // Fetch user data to check if they are admin
    const userRef = firebase.firestore().collection("user").doc(user.uid);
    userRef.get().then((doc) => {
      if (doc.exists && doc.data().admin) {
        // User is an admin, allow access
        loadEnquiries();
      } else {
        // User is not an admin, redirect to login or another page
        alert("Access denied. Admins only.");
        window.location.href = "login.html"; // Redirect to login
      }
    }).catch((error) => {
      console.error("Error checking admin status: ", error);
      alert("An error occurred. Please try again.");
    });
  } else {
    // User is not logged in, redirect to login
    window.location.href = "login.html"; // Redirect to login
  }
});

// Load all enquiries
function loadEnquiries() {
  const enquiriesList = document.getElementById("enquiriesList");
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.style.display = "none"; // Hide loading message
  
  firebase.firestore().collection("enquiries").get().then(snapshot => {
    snapshot.forEach(doc => {
      const enquiry = doc.data();
      const enquiryId = doc.id;
      
      const enquiryElement = document.createElement("div");
      enquiryElement.classList.add("enquiry");
      enquiryElement.innerHTML = `
        <p><strong>Student Name:</strong> ${enquiry.studentName}</p>
        <p><strong>Class Applying:</strong> ${enquiry.classApplying}</p>
        <p><strong>Parent Name:</strong> ${enquiry.parentName}</p>
        <p><strong>Phone:</strong> ${enquiry.phone}</p>
        <button onclick="editEnquiry('${enquiryId}')">Edit</button>
        <button onclick="deleteEnquiry('${enquiryId}')">Delete</button>
      `;
      enquiriesList.appendChild(enquiryElement);
    });
  }).catch((error) => {
    console.error("Error fetching enquiries: ", error);
    alert("There was an error loading the data. Please try again.");
  });
}

// Edit enquiry
function editEnquiry(enquiryId) {
  const newStudentName = prompt("Enter new student name:");
  if (newStudentName) {
    firebase.firestore().collection("enquiries").doc(enquiryId).update({
      studentName: newStudentName
    }).then(() => {
      alert("Enquiry updated successfully!");
      location.reload(); // Reload to reflect changes
    }).catch((error) => {
      console.error("Error updating enquiry: ", error);
      alert("There was an error updating the enquiry. Please try again.");
    });
  }
}

// Delete enquiry
function deleteEnquiry(enquiryId) {
  if (confirm("Are you sure you want to delete this enquiry?")) {
    firebase.firestore().collection("enquiries").doc(enquiryId).delete().then(() => {
      alert("Enquiry deleted successfully!");
      location.reload(); // Reload to reflect changes
    }).catch((error) => {
      console.error("Error deleting enquiry: ", error);
      alert("There was an error deleting the enquiry. Please try again.");
    });
  }
}
