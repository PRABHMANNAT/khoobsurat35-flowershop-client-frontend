const photos = {
  roses: 'https://images.unsplash.com/photo-1487035092507-28f5c8ba203e?auto=format&fit=crop&w=1200&q=85',
  pastel: 'https://images.unsplash.com/photo-1622296885521-77549e53b888?auto=format&fit=crop&w=1200&q=85',
  red: 'https://images.unsplash.com/photo-1671004338674-bcb0579ebfee?auto=format&fit=crop&w=1200&q=85',
  blush: 'https://images.unsplash.com/photo-1626161290912-d415a83683fb?auto=format&fit=crop&w=1200&q=85',
  gift: 'https://images.unsplash.com/photo-1683844234556-bc37ff33efc1?auto=format&fit=crop&w=1200&q=85'
};
const products = [
  {id:1,name:'The Blush Edit',price:1299,description:'Soft pinks. The sweetest little gesture.',image:photos.blush,category:'gentle',tag:'A SOFT SPOT'},
  {id:2,name:'Love, in Bloom',price:1499,description:'Romantic roses. A whole lot of feeling.',image:photos.roses,category:'romance',tag:'THE ROMANTIC'},
  {id:3,name:'Pastel Poetry',price:1699,description:'A dreamy gathering of delicate blooms.',image:photos.pastel,category:'joy',tag:'A LITTLE JOY'},
  {id:4,name:'Forever Yours',price:1899,description:'Classic red roses, beautifully gathered.',image:photos.red,category:'romance',tag:'TIMELESS LOVE'},
  {id:5,name:'A Sweet Surprise',price:1199,description:'Wrapped with love. Ready to make a day.',image:photos.gift,category:'joy',tag:'JUST BECAUSE'},
  {id:6,name:'Sunday Kind of Love',price:1599,description:'Gentle colours for life’s quieter moments.',image:photos.pastel,category:'gentle',tag:'SLOW & LOVELY'}
];
const cart = new Map();
const money = value => '₹' + value.toLocaleString('en-IN');
const cartDialog = document.querySelector('#cart-dialog');
const bookingDialog = document.querySelector('#booking-dialog');
document.querySelector('#hero-image').src=photos.blush;
document.querySelector('#shop-image').src='https://floweraura-blog-img.s3.ap-south-1.amazonaws.com/flower-gifts-blog/vendors-in-flower-market.jpg';
document.querySelector('#year').textContent=new Date().getFullYear();
const today = new Date();
document.querySelector('[name=date]').min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
function renderProducts(filter='all') {
  document.querySelector('#products').innerHTML=products.filter(p=>filter==='all'||p.category===filter).map(p=>`<article class="product"><div class="product-image"><img src="${p.image}" alt="${p.name} flower arrangement" loading="lazy"><span class="tag">${p.tag}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div><div class="product-info"><h3>${p.name}</h3><strong>${money(p.price)}</strong></div><p>${p.description}</p></article>`).join('');
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',b.dataset.filter===filter);});
}
function renderCart(){
  let count=0,total=0;
  const lines=[...cart].map(([id,qty])=>{const p=products.find(p=>p.id===id);count+=qty;total+=qty*p.price;return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)}</p><div class="quantity"><button data-change="${id}" data-delta="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${qty}</span><button data-change="${id}" data-delta="1" aria-label="Increase ${p.name} quantity">+</button></div></div><button class="remove" data-remove="${id}" aria-label="Remove ${p.name}">Remove</button></div>`;});
  document.querySelectorAll('.cart-count').forEach(e=>e.textContent=count);
  document.querySelector('#cart-body').innerHTML=lines.length?lines.join(''):'<div class="empty-cart"><span>✳</span><h3>A little room for joy.</h3><p>Your bag is waiting for something beautiful.</p><button class="button primary" data-browse>Explore the flowers ↗</button></div>';
  document.querySelector('#cart-bottom').innerHTML=lines.length?`<div class="cart-total"><span>Subtotal</span><strong>${money(total)}</strong></div><button class="button primary" id="book">Plan my booking <span>↗</span></button><p>Sample prices. Pick-up booking preview only — no payment required.</p>`:'';
}
let toastTimer;
function notify(message){const el=document.querySelector('.toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2800);}
function openDialog(dialog){dialog.showModal();document.body.style.overflow='hidden';}
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>document.body.style.overflow='');
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
});
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){const id=Number(add.dataset.add);cart.set(id,(cart.get(id)||0)+1);renderCart();notify(`${products.find(p=>p.id===id).name} added to your bag`);}
  const filter=e.target.closest('[data-filter]');if(filter)renderProducts(filter.dataset.filter);
  const occasion=e.target.closest('[data-occasion]');if(occasion){renderProducts(occasion.dataset.occasion==='birthday'?'joy':occasion.dataset.occasion);document.querySelector('#collection').scrollIntoView({behavior:'smooth'});}
  if(e.target.closest('.cart-trigger')){renderCart();openDialog(cartDialog);}
  if(e.target.closest('.close-dialog'))e.target.closest('dialog').close();
  const change=e.target.closest('[data-change]');if(change){const id=Number(change.dataset.change);const next=cart.get(id)+Number(change.dataset.delta);if(next>0)cart.set(id,next);else cart.delete(id);renderCart();}
  const remove=e.target.closest('[data-remove]');if(remove){cart.delete(Number(remove.dataset.remove));renderCart();}
  if(e.target.closest('[data-browse]')){cartDialog.close();document.querySelector('#collection').scrollIntoView({behavior:'smooth'});}
  if(e.target.closest('#book')){cartDialog.close();document.querySelector('#booking-form').hidden=false;document.querySelector('#booking-success').hidden=true;openDialog(bookingDialog);}
});
document.querySelector('#booking-form').addEventListener('submit',e=>{
  e.preventDefault();const form=new FormData(e.target);const date=new Date(form.get('date')+'T12:00:00');
  document.querySelector('#success-summary').textContent=`${form.get('name')}, your sample pick-up is planned for ${date.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}. Your flower bag has ${[...cart.values()].reduce((a,b)=>a+b,0)} arrangement(s).`;
  e.target.hidden=true;document.querySelector('#booking-success').hidden=false;
});
renderProducts();renderCart();
