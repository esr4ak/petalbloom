/* =============================================
   STAGE 6 — Interaction & Dynamism
   IST4130 Web Programming — Petal & Bloom
   Group 2: Esra Ak (23023009),
            Orhan Koca (22023070),
            Hüseyin Barış Akçay (22023060)
   Yıldız Teknik Üniversitesi — Davutpaşa
   Instructor: Erhan Cene
   =============================================
   Techniques (Ch. 23–26):
   ✅ addEventListener — NO inline handlers
   ✅ DOM Traversing: parentNode, children,
      querySelector, nextElementSibling
   ✅ DOM Manipulation: createElement,
      appendChild, innerHTML, textContent,
      classList, style
   ✅ Events: click, change, input, keyup,
      mouseover, mouseout, submit
   ✅ Form validation with DOM error display
   ✅ Cart state (array) + checkout modal
   ✅ Dynamic review creation
   ============================================= */

// ─────────────────────────────────────────────
// DOMContentLoaded — ensures DOM is fully loaded
// before any element is accessed (Ch. 23)
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

    
    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    var cart = [];   // Array of {name, price, image, quantity}
    
    // ─────────────────────────────────────────────
    // DOM REFERENCES
    // ─────────────────────────────────────────────
    var cartSidebar        = document.getElementById('cart-sidebar');
    var cartOverlay        = document.getElementById('cart-overlay');
    var cartItemsContainer = document.getElementById('cart-items');
    var cartCountBadge     = document.getElementById('cart-count');
    var cartTotalPrice     = document.getElementById('cart-total-price');
    var toastEl            = document.getElementById('toast');
    var checkoutModal      = document.getElementById('checkout-modal');
    var summaryItemsEl     = document.getElementById('summary-items');
    var summaryTotalEl     = document.getElementById('summary-total-amount');
    
    // ─────────────────────────────────────────────
    // CART SIDEBAR TOGGLE
    // ─────────────────────────────────────────────
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    }
    
    function closeCart() {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
    
    // ─────────────────────────────────────────────
    // CHECKOUT MODAL
    // ─────────────────────────────────────────────
    function openCheckoutModal() {
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
    
        // Close cart sidebar first
        closeCart();
    
        // Populate order summary inside modal
        summaryItemsEl.innerHTML = '';
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            var row = document.createElement('div');
            row.className = 'summary-item';
    
            var nameSpan = document.createElement('span');
            nameSpan.textContent = item.name + ' x' + item.quantity;
    
            var priceSpan = document.createElement('span');
            priceSpan.textContent = '$' + (item.price * item.quantity).toFixed(2);
    
            row.appendChild(nameSpan);
            row.appendChild(priceSpan);
            summaryItemsEl.appendChild(row);
        }
    
        summaryTotalEl.textContent = '$' + calculateTotal().toFixed(2);
    
        // Show modal
        checkoutModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    function closeCheckoutModal() {
        checkoutModal.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    // ─────────────────────────────────────────────
    // ADD TO CART
    // ─────────────────────────────────────────────
    function addToCart(name, price, image, quantity) {
        var qty = quantity || 1;
    
        // DOM Traversing: check if item already in cart array
        var existing = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].name === name) {
                existing = cart[i];
                break;
            }
        }
    
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({ name: name, price: price, image: image, quantity: qty });
        }
    
        updateCartDisplay();
        showToast(name + ' added to cart!');
        animateCartBadge();
    }
    
    // ─────────────────────────────────────────────
    // REMOVE FROM CART
    // ─────────────────────────────────────────────
    function removeFromCart(name) {
        cart = cart.filter(function(item) { return item.name !== name; });
        updateCartDisplay();
        showToast(name + ' removed from cart');
    }
    
    // ─────────────────────────────────────────────
    // UPDATE QUANTITY IN CART
    // ─────────────────────────────────────────────
    function updateQuantity(name, change) {
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].name === name) {
                cart[i].quantity += change;
                if (cart[i].quantity <= 0) {
                    removeFromCart(name);
                    return;
                }
                break;
            }
        }
        updateCartDisplay();
    }
    
    // ─────────────────────────────────────────────
    // CLEAR CART
    // ─────────────────────────────────────────────
    function clearCart() {
        cart = [];
        updateCartDisplay();
        showToast('Cart cleared');
    }
    
    // ─────────────────────────────────────────────
    // CALCULATE TOTAL
    // ─────────────────────────────────────────────
    function calculateTotal() {
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].price * cart[i].quantity;
        }
        return total;
    }
    
    // ─────────────────────────────────────────────
    // UPDATE CART DISPLAY (DOM Manipulation)
    // ─────────────────────────────────────────────
    function updateCartDisplay() {
        // Clear existing content
        cartItemsContainer.innerHTML = '';
    
        if (cart.length === 0) {
            var emptyMsg = document.createElement('p');
            emptyMsg.className = 'cart-empty';
            emptyMsg.innerHTML = '<i class="fas fa-shopping-basket"></i>Your cart is empty';
            cartItemsContainer.appendChild(emptyMsg);
        } else {
            for (var i = 0; i < cart.length; i++) {
                var el = createCartItemElement(cart[i]);
                cartItemsContainer.appendChild(el);
            }
        }
    
        // Update total
        cartTotalPrice.textContent = '$' + calculateTotal().toFixed(2);
    
        // Update badge count
        var totalItems = 0;
        for (var j = 0; j < cart.length; j++) { totalItems += cart[j].quantity; }
        cartCountBadge.textContent = totalItems;
    
        // DOM Traversing: log child count to verify (Ch. 24)
        console.log('Cart DOM updated. Items rendered: ' + cartItemsContainer.children.length);
    }
    
    // ─────────────────────────────────────────────
    // CREATE CART ITEM ELEMENT (DOM Creation)
    // ─────────────────────────────────────────────
    function createCartItemElement(item) {
        var div = document.createElement('div');
        div.className = 'cart-item';
    
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
    
        // Info
        var infoDiv = document.createElement('div');
        infoDiv.className = 'cart-item-info';
    
        var h4 = document.createElement('h4');
        h4.textContent = item.name;
    
        var priceP = document.createElement('p');
        priceP.className = 'item-price';
        priceP.textContent = '$' + (item.price * item.quantity).toFixed(2);
    
        infoDiv.appendChild(h4);
        infoDiv.appendChild(priceP);
    
        // Controls
        var controlsDiv = document.createElement('div');
        controlsDiv.className = 'cart-item-controls';
    
        var minusBtn = document.createElement('button');
        minusBtn.className = 'qty-btn';
        minusBtn.textContent = '−';
        // Closure to capture item.name
        (function(name) {
            minusBtn.addEventListener('click', function() { updateQuantity(name, -1); });
        })(item.name);
    
        var qtySpan = document.createElement('span');
        qtySpan.className = 'qty-display';
        qtySpan.textContent = item.quantity;
    
        var plusBtn = document.createElement('button');
        plusBtn.className = 'qty-btn';
        plusBtn.textContent = '+';
        (function(name) {
            plusBtn.addEventListener('click', function() { updateQuantity(name, 1); });
        })(item.name);
    
        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        (function(name) {
            removeBtn.addEventListener('click', function() { removeFromCart(name); });
        })(item.name);
    
        controlsDiv.appendChild(minusBtn);
        controlsDiv.appendChild(qtySpan);
        controlsDiv.appendChild(plusBtn);
        controlsDiv.appendChild(removeBtn);
    
        div.appendChild(img);
        div.appendChild(infoDiv);
        div.appendChild(controlsDiv);
    
        return div;
    }
    
    // ─────────────────────────────────────────────
    // TOAST NOTIFICATION
    // ─────────────────────────────────────────────
    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add('show');
        setTimeout(function() { toastEl.classList.remove('show'); }, 2500);
    }
    
    // ─────────────────────────────────────────────
    // ANIMATE CART BADGE
    // ─────────────────────────────────────────────
    function animateCartBadge() {
        cartCountBadge.classList.add('bump');
        setTimeout(function() { cartCountBadge.classList.remove('bump'); }, 300);
    }
    
    // ─────────────────────────────────────────────
    // SMOOTH SCROLL (Ch. 23)
    // ─────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });
    
    // ─────────────────────────────────────────────
    // EVENT LISTENERS (Ch. 23–25)
    // ALL via addEventListener — no inline handlers
    // ─────────────────────────────────────────────
    
    // 1. Cart open/close
    document.getElementById('cart-toggle').addEventListener('click', toggleCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    
    // 2. Checkout button → open modal (not alert)
    document.getElementById('checkout-btn').addEventListener('click', openCheckoutModal);
    document.getElementById('modal-close').addEventListener('click', closeCheckoutModal);
    
    // Close modal when clicking outside modal-box
    checkoutModal.addEventListener('click', function(e) {
        if (e.target === checkoutModal) { closeCheckoutModal(); }
    });
    
    // 3. Add to Cart buttons — DOM Traversing (Ch. 24 & 25)
    //    button → parentNode (.product-info) → parentNode (.product-card)
    document.querySelectorAll('.add-to-cart-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            var productInfo = button.parentNode;        // .product-info
            var productCard = productInfo.parentNode;   // .product-card
    
            var name  = productCard.getAttribute('data-name');
            var price = parseFloat(productCard.getAttribute('data-price'));
            var imgEl = productCard.querySelector('.product-image img');
            var image = imgEl ? imgEl.getAttribute('src') : '';
    
            // DOM Traversing: find qty display sibling inside product-info
            var qtyDisplay = productInfo.querySelector('.qty-display-product');
            var quantity   = qtyDisplay ? parseInt(qtyDisplay.textContent, 10) : 1;
    
            addToCart(name, price, image, quantity);
    
            // Reset card qty back to 1 after adding
            if (qtyDisplay) { qtyDisplay.textContent = '1'; }
        });
    });
    
    // 4. Product card quantity +/− (Ch. 25)
    document.querySelectorAll('.product-card').forEach(function(card) {
        var qtyDisplay = card.querySelector('.qty-display-product');
        var qtyBtns    = card.querySelectorAll('.qty-btn-product');
    
        qtyBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action  = btn.getAttribute('data-action');
                var current = parseInt(qtyDisplay.textContent, 10);
                if (action === 'plus') {
                    qtyDisplay.textContent = current + 1;
                } else if (action === 'minus' && current > 1) {
                    qtyDisplay.textContent = current - 1;
                }
            });
        });
    });
    
    // 5. Mouseover / mouseout on product cards (Ch. 25 Mouse Events)
    document.querySelectorAll('.product-card').forEach(function(card) {
        card.addEventListener('mouseover', function(e) {
            card.classList.add('card-hovered');
            console.log('mouseover | product: ' + card.getAttribute('data-name') + ' | t: ' + e.timeStamp.toFixed(0) + 'ms');
        });
        card.addEventListener('mouseout', function() {
            card.classList.remove('card-hovered');
        });
    });
    
    // 6. Keyboard: Escape closes cart or modal (Ch. 25 Keyboard Events)
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (checkoutModal.classList.contains('open')) {
                closeCheckoutModal();
            } else if (cartSidebar.classList.contains('open')) {
                closeCart();
                showToast('Cart closed (Escape)');
            }
        }
    });
    
    // 7. Checkout form submit (Ch. 25 submit event + DOM Traversing validation)
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
    
        var nameInput    = document.getElementById('co-name');
        var emailInput   = document.getElementById('co-email');
        var addressInput = document.getElementById('co-address');
    
        var fullName = nameInput.value.trim();
        var email    = emailInput.value.trim();
        var address  = addressInput.value.trim();
    
        // Validation: name
        if (fullName.length < 2) {
            showToast('Please enter a valid name (min. 2 characters)');
            // DOM Traversing: input → parentNode for error class (Ch. 24)
            nameInput.parentNode.classList.add('form-group-error');
            setTimeout(function() { nameInput.parentNode.classList.remove('form-group-error'); }, 3000);
            nameInput.focus();
            return;
        }
    
        // Validation: email
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address');
            emailInput.parentNode.classList.add('form-group-error');
            setTimeout(function() { emailInput.parentNode.classList.remove('form-group-error'); }, 3000);
            emailInput.focus();
            return;
        }
    
        // Validation: address
        if (address.length < 5) {
            showToast('Please enter a delivery address');
            addressInput.parentNode.classList.add('form-group-error');
            setTimeout(function() { addressInput.parentNode.classList.remove('form-group-error'); }, 3000);
            addressInput.focus();
            return;
        }
    
        // Build order summary
        var total    = calculateTotal();
        var occasion = document.getElementById('co-occasion').value;
        var date     = document.getElementById('co-date').value;
        var message  = document.getElementById('co-message').value.trim();
        var newsLetter = document.getElementById('co-newsletter').checked;
    
        var summary = '🌸 Order Confirmed — Petal & Bloom 🌸\n\n';
        summary += 'Name: '    + fullName  + '\n';
        summary += 'Email: '   + email     + '\n';
        summary += 'Address: ' + address   + '\n';
        summary += 'Occasion: '+ occasion  + '\n';
        if (date)    { summary += 'Delivery: ' + date    + '\n'; }
        if (message) { summary += 'Message: '  + message + '\n'; }
        summary += '\nItems:\n';
        for (var i = 0; i < cart.length; i++) {
            summary += '  ' + cart[i].name + ' x' + cart[i].quantity + ' — $' + (cart[i].price * cart[i].quantity).toFixed(2) + '\n';
        }
        summary += '\nTotal: $' + total.toFixed(2);
        summary += '\nNewsletter: ' + (newsLetter ? 'Yes' : 'No');
        summary += '\n\nThank you! We will contact you shortly to confirm.';
    
        alert(summary);
    
        // Clear cart and close modal
        cart = [];
        updateCartDisplay();
        closeCheckoutModal();
        document.getElementById('checkout-form').reset();
        showToast('Order placed! Thank you, ' + fullName + '! 🌸');
    });
    
    // ─────────────────────────────────────────────
    // REVIEWS — Submit new review to DOM (Ch. 24 & 25)
    // ─────────────────────────────────────────────
    document.getElementById('submit-review-btn').addEventListener('click', function() {
        var nameInput    = document.getElementById('review-name');
        var textInput    = document.getElementById('review-text');
        var productInput = document.getElementById('review-product');
        var reviewsList  = document.getElementById('reviews-list');
    
        var reviewName    = nameInput.value.trim();
        var reviewText    = textInput.value.trim();
        var reviewProduct = productInput.value;
    
        // Get selected star rating
        var ratingInputs = document.getElementsByName('rating');
        var selectedRating = 0;
        for (var i = 0; i < ratingInputs.length; i++) {
            if (ratingInputs[i].checked) {
                selectedRating = parseInt(ratingInputs[i].value, 10);
                break;
            }
        }
    
        // Validate
        if (reviewName.length < 2) {
            showToast('Please enter your name');
            nameInput.style.borderColor = 'hsl(0, 60%, 55%)';
            setTimeout(function() { nameInput.style.borderColor = ''; }, 2500);
            return;
        }
    
        if (selectedRating === 0) {
            showToast('Please select a star rating');
            return;
        }
    
        if (reviewText.length < 10) {
            showToast('Please write a review (min. 10 characters)');
            textInput.style.borderColor = 'hsl(0, 60%, 55%)';
            setTimeout(function() { textInput.style.borderColor = ''; }, 2500);
            return;
        }
    
        // Build star HTML string
        var starsHTML = '';
        for (var s = 1; s <= 5; s++) {
            if (s <= selectedRating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
    
        // Create new blockquote element (DOM Creation — Ch. 24)
        var newReview = document.createElement('blockquote');
    
        var reviewP = document.createElement('p');
        reviewP.textContent = '"' + reviewText + '"';
    
        // Product tag if selected
        var productTag = '';
        if (reviewProduct) {
            productTag = ' <span style="font-size:0.75rem;background:hsl(185,30%,92%);color:hsl(185,50%,28%);padding:2px 8px;border-radius:8px;font-style:normal;">' + reviewProduct + '</span>';
        }
    
        var starsDiv = document.createElement('div');
        starsDiv.className = 'stars';
        starsDiv.innerHTML = starsHTML;
    
        var cite = document.createElement('cite');
        // DOM Traversing: use innerHTML to include product tag
        cite.innerHTML = '— ' + reviewName + productTag;
    
        newReview.appendChild(reviewP);
        newReview.appendChild(starsDiv);
        newReview.appendChild(cite);
    
        // Add a "new" highlight style via classList
        newReview.style.borderLeftColor = 'hsl(160, 60%, 40%)';
        newReview.style.backgroundColor = 'hsl(160, 40%, 96%)';
    
        // DOM Manipulation: prepend new review at top of list (Ch. 24)
        var firstReview = reviewsList.children[0];
        if (firstReview) {
            reviewsList.insertBefore(newReview, firstReview);
        } else {
            reviewsList.appendChild(newReview);
        }
    
        // Animate in
        newReview.style.opacity = '0';
        newReview.style.transform = 'translateY(-10px)';
        newReview.style.transition = 'all 0.4s ease';
    
        // Use setTimeout to trigger transition (must happen after DOM paint)
        setTimeout(function() {
            newReview.style.opacity = '1';
            newReview.style.transform = 'translateY(0)';
        }, 30);
    
        // Reset form
        nameInput.value    = '';
        textInput.value    = '';
        productInput.value = '';
        for (var r = 0; r < ratingInputs.length; r++) { ratingInputs[r].checked = false; }
    
        showToast('Thank you for your review, ' + reviewName + '!');
    
        // DOM Traversing: scroll to reviews list to show new entry
        reviewsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
        // Log DOM children count (Ch. 24 DOM Traversing)
        console.log('Reviews list now has: ' + reviewsList.children.length + ' reviews');
    });

}); // end DOMContentLoaded
