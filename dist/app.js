const products=[
  {id:1,name:'Rose & Gypsophila',type:'rose',price:899,image:'images/unnamed%20(8).webp',note:'Pink roses with delicate white fillers.',detail:'A soft, easy-going bunch for birthdays, desk days, and thoughtful little gestures.'},
  {id:2,name:'The Classic Dozen',type:'rose',price:1199,image:'images/unnamed%20(11).webp',note:'A timeless red and white rose mix.',detail:'A classic rose arrangement with all the romance, wrapped and ready to give.'},
  {id:3,name:'Birthday Lilies & Treats',type:'gift',price:1599,image:'images/unnamed%20(5).webp',note:'Lilies, chocolates and a little celebration.',detail:'An all-in-one birthday moment with fresh flowers and something sweet alongside.'},
  {id:4,name:'Fresh Flower Counter',type:'bouquet',price:1299,image:'images/unnamed%20(15).webp',note:'Choose the colour mood you love.',detail:'A florist-led seasonal gathering. Tell us your preferred colour story at pickup.'},
  {id:5,name:'Yellow Rose Wrap',type:'rose',price:799,image:'images/unnamed%20(10).webp',note:'Bright roses tied in a simple paper wrap.',detail:'Sunny, uncomplicated roses wrapped for a just-because kind of day.'},
  {id:6,name:'Garden Colour Mix',type:'bouquet',price:1799,image:'images/unnamed%20(6).webp',note:'A bold mix for a full-hearted gesture.',detail:'A colourful, abundant mix for the moments that ask for something extra.'}
];

const cart=new Map();
const savedFavorites=(()=>{try{return JSON.parse(localStorage.getItem('k35-favorites')||'[]')}catch{return[]}})();
const favorites=new Set(savedFavorites);
const money=value=>`₹${value.toLocaleString('en-IN')}`;
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const cartDialog=document.querySelector('#cart-dialog');
const bookingDialog=document.querySelector('#booking-dialog');
const productDialog=document.querySelector('#product-dialog');
const toast=document.querySelector('.toast');
let activeFilter='all',searchTerm='',sortBy='featured',activeSlide=0;

document.querySelector('#year').textContent=new Date().getFullYear();
const today=new Date();
document.querySelector('[name="date"]').min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

function filteredProducts(){
  const visible=products.filter(product=>{
    const matchesFilter=activeFilter==='all'||product.type===activeFilter;
    const searchable=`${product.name} ${product.note} ${product.type}`.toLowerCase();
    return matchesFilter&&searchable.includes(searchTerm);
  });
  return visible.sort((a,b)=>sortBy==='low'?a.price-b.price:sortBy==='high'?b.price-a.price:sortBy==='name'?a.name.localeCompare(b.name):a.id-b.id);
}

function observeCards(){
  const cards=document.querySelectorAll('.product-card');
  if(!('IntersectionObserver'in window)){cards.forEach(card=>card.classList.add('in-view'));return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:.1});
  cards.forEach((card,index)=>{card.style.transitionDelay=`${index*45}ms`;observer.observe(card)});
}

function renderProducts(){
  const visible=filteredProducts();
  document.querySelector('#collection-count').textContent=`${visible.length} ${visible.length===1?'piece':'pieces'}`;
  document.querySelector('#products').innerHTML=visible.length?visible.map(product=>{
    const quantity=cart.get(product.id)||0;
    const cardControl=quantity?`<div class="card-quantity" aria-label="${quantity} ${product.name} in bag"><button type="button" data-change="${product.id}" data-delta="-1" aria-label="Remove one ${product.name}">−</button><b aria-live="polite">${quantity}</b><button type="button" data-change="${product.id}" data-delta="1" aria-label="Add another ${product.name}">+</button></div>`:`<button class="product-action add-button" data-add="${product.id}" aria-label="Add ${product.name} to bag">${icon('plus')}</button>`;
    return `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <button class="product-action favorite-button ${favorites.has(product.id)?'is-saved':''}" data-favorite="${product.id}" aria-label="${favorites.has(product.id)?'Remove':'Save'} ${product.name}" aria-pressed="${favorites.has(product.id)}">${icon('heart')}</button>
        ${cardControl}
        <button class="product-action view-button" data-view="${product.id}" aria-label="View ${product.name} details">${icon('arrow')}</button>
      </div>
      <div class="product-meta"><div><h3>${product.name}</h3><p>${product.note}</p></div><strong>${money(product.price)}</strong></div>
    </article>`}).join(''):`<div class="no-results"><h3>Nothing matched just yet.</h3><p>Try another flower, colour or feeling.</p><button class="underlink" data-clear-search type="button"><span>Clear search</span>${icon('arrow')}</button></div>`;
  document.querySelectorAll('[data-filter]').forEach(button=>{const isActive=button.dataset.filter===activeFilter;button.classList.toggle('active',isActive);button.setAttribute('aria-pressed',isActive)});
  observeCards();
}

function renderCart(){
  let total=0,count=0;
  const items=[...cart].map(([id,quantity])=>{
    const product=products.find(item=>item.id===id);total+=product.price*quantity;count+=quantity;
    return `<div class="cart-line"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity"><button data-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${quantity}</span><button data-change="${id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove" data-remove="${id}">Remove</button></div>`;
  });
  document.querySelectorAll('.cart-count').forEach(element=>element.textContent=count);
  document.querySelector('#cart-body').innerHTML=items.length?items.join(''):`<div class="empty"><p class="empty-mark">✦</p><h3>Your flower bag is waiting.</h3><p>Choose something lovely for someone — including you.</p><button class="underlink" data-browse type="button"><span>Browse the flower edit</span>${icon('arrow')}</button></div>`;
  document.querySelector('#cart-bottom').innerHTML=items.length?`<div class="subtotal"><span>Subtotal</span><b>${money(total)}</b></div><button class="button dark booking-open" type="button"><span>Plan a flower moment</span>${icon('calendar')}</button><p class="cart-note">A visual shopping preview only — no payment or order is sent.</p>`:'';
}

function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2600)}
function openDialog(dialog){dialog.showModal();document.body.classList.add('modal-open')}
function closeDialog(dialog){dialog.close();document.body.classList.remove('modal-open')}
function storeFavorites(){try{localStorage.setItem('k35-favorites',JSON.stringify([...favorites]))}catch{}}
function openProduct(id){
  const product=products.find(item=>item.id===id);
  document.querySelector('#product-detail').innerHTML=`<img class="product-detail-image" src="${product.image}" alt="${product.name}"><div class="product-detail-copy"><p class="kicker">THE DAILY FLOWER EDIT · ${product.type.toUpperCase()}</p><h2>${product.name}</h2><span class="detail-price">${money(product.price)}</span><p>${product.detail}</p><p class="detail-note">Fresh stems vary with the season. For a particular flower or colour palette, add a note to your booking.</p><button class="button dark" data-detail-add="${product.id}" type="button"><span>Add to flower bag</span>${icon('bag')}</button></div>`;
  openDialog(productDialog);
}

function activateSlide(index){
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('[data-slide]')];
  activeSlide=(index+slides.length)%slides.length;
  slides.forEach((slide,slideIndex)=>slide.classList.toggle('active',slideIndex===activeSlide));
  dots.forEach((dot,dotIndex)=>{const isActive=dotIndex===activeSlide;dot.classList.toggle('active',isActive);dot.setAttribute('aria-selected',isActive)});
  document.querySelector('#hero-number').textContent=String(activeSlide+1).padStart(2,'0');
}

function setActiveNav(id){
  document.querySelectorAll('[data-nav]').forEach(link=>{
    const isActive=link.dataset.nav===id;
    link.classList.toggle('active',isActive);
    if(isActive) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
}

document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog)}));
document.querySelector('#flower-search').addEventListener('input',event=>{searchTerm=event.target.value.trim().toLowerCase();renderProducts()});
document.querySelector('#sort-products').addEventListener('change',event=>{sortBy=event.target.value;renderProducts()});
document.querySelector('.scroll-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>activateSlide(Number(button.dataset.slide))));
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(()=>activateSlide(activeSlide+1),5200);
window.addEventListener('scroll',()=>document.querySelector('.scroll-top').classList.toggle('show',window.scrollY>550),{passive:true});

if('IntersectionObserver'in window){
  const navLinks=document.querySelectorAll('[data-nav]');
  const sections=['top','flowers','visit'].map(id=>document.querySelector(`#${id}`));
  setActiveNav('top');
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActiveNav(entry.target.id)}),{rootMargin:'-35% 0px -55% 0px'});
  sections.forEach(section=>navObserver.observe(section));
  const studio=document.querySelector('.story-panel');
  new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('in-view')}),{threshold:.2}).observe(studio);
}

document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add],[data-detail-add]');
  if(add){const id=Number(add.dataset.add||add.dataset.detailAdd);cart.set(id,(cart.get(id)||0)+1);renderCart();renderProducts();if(productDialog.open)closeDialog(productDialog);notify(`${products.find(product=>product.id===id).name} added to your flower bag`);return;}
  const favorite=event.target.closest('[data-favorite]');
  if(favorite){const id=Number(favorite.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);storeFavorites();renderProducts();notify(favorites.has(id)?'Saved for later':'Removed from saved flowers');return;}
  const view=event.target.closest('[data-view]');if(view){openProduct(Number(view.dataset.view));return;}
  const filter=event.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;renderProducts();return;}
  const filterLink=event.target.closest('[data-filter-link]');if(filterLink){activeFilter=filterLink.dataset.filterLink;searchTerm='';document.querySelector('#flower-search').value='';renderProducts();return;}
  if(event.target.closest('.bag-button,[data-open-bag]')){renderCart();openDialog(cartDialog);return;}
  const close=event.target.closest('.close-dialog');if(close){closeDialog(close.closest('dialog'));return;}
  const change=event.target.closest('[data-change]');if(change){const id=Number(change.dataset.change),next=cart.get(id)+Number(change.dataset.delta);next>0?cart.set(id,next):cart.delete(id);renderCart();renderProducts();return;}
  const remove=event.target.closest('[data-remove]');if(remove){cart.delete(Number(remove.dataset.remove));renderCart();renderProducts();return;}
  if(event.target.closest('[data-browse]')){closeDialog(cartDialog);document.querySelector('#flowers').scrollIntoView({behavior:'smooth'});return;}
  if(event.target.closest('[data-clear-search]')){searchTerm='';document.querySelector('#flower-search').value='';renderProducts();return;}
  if(event.target.closest('.booking-open')){if(cartDialog.open)closeDialog(cartDialog);document.querySelector('#booking-form').hidden=false;document.querySelector('#booking-success').hidden=true;openDialog(bookingDialog);return;}
  if(event.target.closest('[data-contact]'))notify('Phone support is coming soon — visit us in Sector 35A.');
});

document.querySelector('#booking-form').addEventListener('submit',event=>{
  event.preventDefault();
  const values=new FormData(event.target),date=new Date(`${values.get('date')}T12:00:00`);
  document.querySelector('#success-summary').textContent=`${values.get('name')}, your ${values.get('occasion').toLowerCase()} is pencilled in for ${date.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}.`;
  event.target.hidden=true;document.querySelector('#booking-success').hidden=false;
});
renderProducts();
renderCart();
