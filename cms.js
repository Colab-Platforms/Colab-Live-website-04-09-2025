// cms.js

document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const blogSection = document.getElementById('blog-section');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authMessage = document.getElementById('auth-message');

    const blogTitleInput = document.getElementById('blog-title');
    const blogAuthorInput = document.getElementById('blog-author');
    const blogDateInput = document.getElementById('blog-date');
    // const blogImageUpload = document.getElementById('blog-image-upload'); // Removed: file input
    const blogImageUrlInput = document.getElementById('blog-image-url'); // URL input
    const blogContentInput = document.getElementById('blog-content');
    const formattingButtons = document.querySelectorAll('.formatting-buttons button');
    const submitBlogBtn = document.getElementById('submit-blog-btn');
    const blogMessage = document.getElementById('blog-message');
    const manageBlogsSection = document.getElementById('manage-blogs-section');
    const blogPostsList = document.getElementById('blog-posts-list');
    const createBlogTitle = document.querySelector('#blog-section h2'); // To change title
    let editingBlogId = null; // To store the ID of the blog being edited

    const initialDisplayLimit = 5; // Show 5 blogs initially
    let currentDisplayLimit = initialDisplayLimit;

    // Firebase Auth Listener
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            authSection.classList.add('hidden');
            blogSection.classList.remove('hidden');
            manageBlogsSection.classList.remove('hidden'); // Show manage section
            authMessage.classList.add('hidden');
            currentDisplayLimit = initialDisplayLimit; // Reset limit on login
            loadBlogPosts(); // Load posts when logged in
        } else {
            // User is signed out
            authSection.classList.remove('hidden');
            blogSection.classList.add('hidden');
            manageBlogsSection.classList.add('hidden'); // Hide manage section
            clearForm(); // Clear form when logged out
        }
    });

    // Event listener for the Cancel Edit button
    document.getElementById('cancel-edit-btn').addEventListener('click', clearForm);

    // Function to load and display blog posts in the CMS
    async function loadBlogPosts() {
        blogPostsList.innerHTML = '<p>Loading blog posts...</p>'; // Show loading message
        try {
            const querySnapshot = await firebase.firestore().collection('blogs').orderBy('createdAt', 'desc').get();
            const allBlogs = [];
            querySnapshot.forEach(doc => {
                allBlogs.push({ id: doc.id, ...doc.data() });
            });

            let html = '';
            const blogsToDisplay = allBlogs.slice(0, currentDisplayLimit);

            if (blogsToDisplay.length === 0) {
                html = '<p>No blog posts to display.</p>';
            } else {
                blogsToDisplay.forEach(blog => {
                    html += `
                        <div class="blog-post-item">
                            <h3>${blog.title}</h3>
                            <p><em>By ${blog.author} on ${blog.date}</em></p>
                            <div class="actions">
                                <button class="edit-btn" data-id="${blog.id}">Edit</button>
                                <button class="delete-btn" data-id="${blog.id}">Delete</button>
                            </div>
                        </div>
                    `;
                });
            }
            blogPostsList.innerHTML = html;

            // Add Show More/Show Less buttons if needed
            if (allBlogs.length > currentDisplayLimit) {
                const showMoreBtn = document.createElement('button');
                showMoreBtn.textContent = 'Show More';
                showMoreBtn.classList.add('show-more-btn');
                showMoreBtn.addEventListener('click', () => {
                    currentDisplayLimit += initialDisplayLimit;
                    loadBlogPosts();
                });
                blogPostsList.appendChild(showMoreBtn);
            }
            
            if (currentDisplayLimit > initialDisplayLimit && allBlogs.length > initialDisplayLimit) {
                const showLessBtn = document.createElement('button');
                showLessBtn.textContent = 'Show Less';
                showLessBtn.classList.add('show-less-btn');
                showLessBtn.addEventListener('click', () => {
                    currentDisplayLimit = initialDisplayLimit;
                    loadBlogPosts();
                });
                blogPostsList.appendChild(showLessBtn);
            }

            // Attach event listeners to new buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => editBlogPost(e.target.dataset.id));
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteBlogPost(e.target.dataset.id));
            });

        } catch (error) {
            console.error("Error loading blog posts:", error);
            blogPostsList.innerHTML = '<p class="error-message">Error loading blog posts. Please try again.</p>';
        }
    }

    // Placeholder functions for edit and delete (will be implemented next)
    async function editBlogPost(id) {
        editingBlogId = id;
        createBlogTitle.textContent = 'Edit Blog Post'; // Change title
        submitBlogBtn.textContent = 'Update Blog Post'; // Change button text
        document.getElementById('cancel-edit-btn').classList.remove('hidden'); // Show cancel button
        blogMessage.classList.add('hidden'); // Clear any previous messages

        try {
            const doc = await firebase.firestore().collection('blogs').doc(id).get();
            if (doc.exists) {
                const blog = doc.data();
                blogTitleInput.value = blog.title;
                blogAuthorInput.value = blog.author;
                blogDateInput.value = blog.date;
                blogImageUrlInput.value = blog.imageUrl;
                blogContentInput.value = blog.content;
                // Scroll to top of form
                blogSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error("Blog post not found for editing.");
                blogMessage.textContent = 'Error: Blog post not found for editing.';
                blogMessage.classList.remove('hidden', 'success', 'info');
                blogMessage.classList.add('error');
            }
        } catch (error) {
            console.error("Error fetching blog post for editing:", error);
            blogMessage.textContent = `Error fetching blog post: ${error.message}`;
            blogMessage.classList.remove('hidden', 'success', 'info');
            blogMessage.classList.add('error');
        }
    }

    async function deleteBlogPost(id) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            try {
                await firebase.firestore().collection('blogs').doc(id).delete();
                blogMessage.textContent = 'Blog post deleted successfully!';
                blogMessage.classList.remove('hidden', 'error', 'info');
                blogMessage.classList.add('success');
                loadBlogPosts(); // Refresh the list
            } catch (error) {
                console.error("Error deleting blog post:", error);
                blogMessage.textContent = `Error deleting blog post: ${error.message}`;
                blogMessage.classList.remove('hidden', 'success', 'info');
                blogMessage.classList.add('error');
            }
        }
    }

    // Login Functionality
    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                authMessage.textContent = 'Logged in successfully!';
                authMessage.classList.remove('hidden', 'error');
                authMessage.classList.add('success');
            })
            .catch((error) => {
                const errorMessage = error.message;
                authMessage.textContent = `Error: ${errorMessage}`;
                authMessage.classList.remove('hidden', 'success');
                authMessage.classList.add('error');
            });
    });

    // Logout Functionality
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            authMessage.textContent = 'Logged out successfully!';
            authMessage.classList.remove('hidden', 'error');
            authMessage.classList.add('success');
        }).catch((error) => {
            const errorMessage = error.message;
            authMessage.textContent = `Error: ${errorMessage}`;
            authMessage.classList.remove('hidden', 'success');
            authMessage.classList.add('error');
        });
    });

    // Formatting Buttons Functionality
    formattingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.dataset.tag;
            let start = blogContentInput.selectionStart;
            let end = blogContentInput.selectionEnd;
            let selectedText = blogContentInput.value.substring(start, end);
            let replacement = '';

            if (tag === 'ul' || tag === 'ol') {
                // For lists, wrap each line of selected text in <li> tags, then wrap in <ul>/<ol>
                const lines = selectedText.split('\n').map(line => `    <li>${line}</li>`).join('\n');
                replacement = `<${tag}>\n${lines}\n</${tag}>`;
            } else if (tag === 'blockquote') {
                 replacement = `<${tag}>\n    ${selectedText}\n</${tag}>`;
            } else if (tag === 'p' && selectedText === '') {
                // Special handling for empty selection with <p> tag
                replacement = `<${tag}>\n    <!-- Enter paragraph text here -->\n</${tag}>`;
            } else {
                replacement = `<${tag}>${selectedText}</${tag}>`;
            }

            blogContentInput.value = blogContentInput.value.substring(0, start) +
                                     replacement +
                                     blogContentInput.value.substring(end, blogContentInput.value.length);

            // Adjust cursor position
            if (selectedText === '') {
                if (tag === 'ul' || tag === 'ol') {
                    blogContentInput.selectionStart = start + `<${tag}>\n    <li>`.length;
                    blogContentInput.selectionEnd = start + `<${tag}>\n    <li>`.length;
                } else if (tag === 'blockquote') {
                    blogContentInput.selectionStart = start + `<${tag}>\n    `.length;
                    blogContentInput.selectionEnd = start + `<${tag}>\n    `.length;
                } else if (tag === 'p') {
                    blogContentInput.selectionStart = start + `<${tag}>\n    <!-- Enter paragraph text here -->`.length;
                    blogContentInput.selectionEnd = start + `<${tag}>\n    <!-- Enter paragraph text here -->`.length;
                } else {
                    blogContentInput.selectionStart = start + `<${tag}>`.length;
                    blogContentInput.selectionEnd = start + `<${tag}>`.length;
                }
            } else {
                blogContentInput.selectionStart = start + `<${tag}>`.length;
                blogContentInput.selectionEnd = start + `<${tag}>`.length + selectedText.length;
            }
        });
    });

    // Submit/Update Blog Post Functionality
    submitBlogBtn.addEventListener('click', async () => {
        const title = blogTitleInput.value;
        const author = blogAuthorInput.value;
        const date = blogDateInput.value;
        const content = blogContentInput.value;
        const imageUrl = blogImageUrlInput.value;

        if (!title || !author || !date || !content) {
            blogMessage.textContent = 'Please fill in all required fields (Title, Author, Date, Content).';
            blogMessage.classList.remove('hidden', 'success');
            blogMessage.classList.add('error');
            return;
        }

        if (!imageUrl) {
            blogMessage.textContent = 'Please provide an image URL.';
            blogMessage.classList.remove('hidden', 'success');
            blogMessage.classList.add('error');
            return;
        }

        blogMessage.textContent = editingBlogId ? 'Updating blog post...' : 'Submitting blog post...';
        blogMessage.classList.remove('hidden', 'success', 'error');
        blogMessage.classList.add('info');

        const blogData = {
            title,
            author,
            date,
            imageUrl,
            content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Add an update timestamp
        };

        try {
            if (editingBlogId) {
                // Update existing blog post
                await firebase.firestore().collection('blogs').doc(editingBlogId).update(blogData);
                blogMessage.textContent = 'Blog post updated successfully!';
            } else {
                // Add new blog post
                blogData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Add creation timestamp for new posts
                await firebase.firestore().collection('blogs').add(blogData);
                blogMessage.textContent = 'Blog post submitted successfully!';
            }

            blogMessage.classList.remove('hidden', 'error', 'info');
            blogMessage.classList.add('success');
            clearForm(); // Clear form and reset to create mode
            loadBlogPosts(); // Refresh the list of blogs
        } catch (error) {
            console.error(editingBlogId ? "Error updating blog post:" : "Error submitting blog post:", error);
            const errorMessage = error.message;
            blogMessage.textContent = `Error ${editingBlogId ? 'updating' : 'submitting'} blog post: ${errorMessage}`;
            blogMessage.classList.remove('hidden', 'success', 'info');
            blogMessage.classList.add('error');
        }
    });

    // Function to clear the form and reset to 'Create New Blog Post' mode
    function clearForm() {
        blogTitleInput.value = '';
        blogAuthorInput.value = '';
        blogDateInput.value = '';
        blogImageUrlInput.value = '';
        blogContentInput.value = '';
        submitBlogBtn.textContent = 'Submit Blog Post'; // Reset button text
        createBlogTitle.textContent = 'Create New Blog Post'; // Reset title
        editingBlogId = null; // Clear editing ID
        document.getElementById('cancel-edit-btn').classList.add('hidden'); // Hide cancel button
        blogMessage.classList.add('hidden'); // Hide message
    }
});
