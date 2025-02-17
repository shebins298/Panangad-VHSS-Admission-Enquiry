// admin.js

document.addEventListener("DOMContentLoaded", function () {
  const adminContainer = document.querySelector(".admin-container");
  const originalContent = adminContainer.innerHTML;
  
  // Show a loading indicator until admin verification is complete.
  adminContainer.innerHTML = `<div style="padding: 20px; text-align: center;"><h2>Loading Admin Panel...</h2></div>`;

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

  // Attach sign-out functionality
  function attachSignOutListener() {
    const signOutBtn = document.getElementById("signOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", async function () {
        await firebase.auth().signOut();
        window.location.href = "login.html";
      });
    }
  }

  // Fetch and display enquiries from Firestore, using a document fragment for efficient DOM updates.
  function fetchEnquiries() {
    const tableBody = document.querySelector("#enquiriesTable tbody");
    db.collection("enquiries")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          tableBody.innerHTML = "";
          if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No enquiries found.</td></tr>`;
          } else {
            const fragment = document.createDocumentFragment();
            snapshot.forEach((doc) => {
              const enquiry = doc.data();
              let timeStr = "";
              if (enquiry.timestamp) {
                try {
                  timeStr = enquiry.timestamp.toDate().toLocaleString();
                } catch (err) {
                  console.error("Error formatting timestamp:", err);
                }
              }
              const tr = document.createElement("tr");
              tr.innerHTML = `
                <td>${enquiry.studentName || ""}</td>
                <td>${enquiry.classApplying || ""}</td>
                <td>${enquiry.parentName || ""}</td>
                <td>${enquiry.phone ? `<a href="tel:${enquiry.phone}" style="color:#007aff; text-decoration:none;">${enquiry.phone}</a>` : ""}</td>
                <td>${timeStr}</td>
              `;
              fragment.appendChild(tr);
            });
            tableBody.appendChild(fragment);
          }
        },
        (error) => {
          console.error("Error fetching enquiries:", error);
        }
      );
  }
});
