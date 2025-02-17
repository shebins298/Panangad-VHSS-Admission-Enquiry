// login.js

document.addEventListener("DOMContentLoaded", function () {
  // Immediately check if a user is already signed in.
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      // Reference the user's document in the "user" collection.
      const userRef = db.collection("user").doc(user.uid);
      try {
        const doc = await userRef.get();
        // If the document exists and admin is true, redirect to admin panel.
        if (doc.exists && doc.data().admin === true) {
          window.location.href = "admin.html";
        } else {
          // If the user exists but is not an admin, you may sign them out.
          await firebase.auth().signOut();
        }
      } catch (error) {
        console.error("Error checking admin status on load:", error);
      }
    }
  });

  // Add click listener for the Google Sign In button.
  document.getElementById("googleSignInBtn").addEventListener("click", async function () {
    // Show loading indicator.
    document.getElementById("loading").style.display = "block";
    document.getElementById("message").innerText = ""; // Clear any previous messages

    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      // Reference to the user's document in the "user" collection.
      const userRef = db.collection("user").doc(user.uid);
      const doc = await userRef.get();

      if (doc.exists) {
        const data = doc.data();
        if (data.admin === true) {
          // If the user is an admin, redirect to the admin panel.
          window.location.href = "admin.html";
        } else {
          // If the user exists but isn't an admin, show pending message.
          document.getElementById("message").innerText = "Your login request is sent to admin.";
          await firebase.auth().signOut();
        }
      } else {
        // First time login: create the user document with a pending status.
        await userRef.set({
          email: user.email,
          displayName: user.displayName,
          admin: false,
          status: "pending"
        });
        document.getElementById("message").innerText = "Your login request is sent to admin.";
        await firebase.auth().signOut();
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      document.getElementById("message").innerText = "Error during sign in. Please try again.";
    } finally {
      // Hide the loading indicator.
      document.getElementById("loading").style.display = "none";
    }
  });
});
