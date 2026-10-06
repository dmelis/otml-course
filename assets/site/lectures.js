// Single source of truth for lecture metadata.
// Section bands: I Fundamentals (1-4), II Computation (5-11), III Generalizations (12-15), IV ML Apps (16-19).
window.CS2840_LECTURES = [
  {n:1,  title:"Introduction",                                     date:"Sep 2, 2025",  section:"i",   kind:"own"},
  {n:2,  title:"Foundations, Monge, Brenier",                      date:"Sep 4, 2025",  section:"i",   kind:"own"},
  {n:3,  title:"Kantorovich, Couplings",                           date:"Sep 9, 2025",  section:"i",   kind:"own"},
  {n:4,  title:"Wasserstein, Duality",                             date:"Sep 11, 2025", section:"i",   kind:"own"},
  {n:5,  title:"c-transforms, Duality, Entropy Regularization",    date:"Sep 16, 2025", section:"ii",  kind:"own"},
  {n:6,  title:"Entropic OT, continued",                           date:"Sep 18, 2025", section:"ii",  kind:"own"},
  {n:7,  title:"Sinkhorn Divergences",                             date:"Sep 23, 2025", section:"ii",  kind:"own"},
  {n:8,  title:"Dynamic OT, Part I",                               date:"Sep 25, 2025", section:"ii",  kind:"own"},
  {n:9,  title:"Dynamic OT, Part II",                              date:"Sep 30, 2025", section:"ii",  kind:"own"},
  {n:10, title:"OT vs. Divergences",                               date:"Oct 2, 2025",  section:"ii",  kind:"own"},
  {n:11, title:"OT as a Loss Function",                            date:"Oct 7, 2025",  section:"ii",  kind:"own"},
  {n:12, title:"Sliced Optimal Transport",                         date:"Oct 9, 2025",  section:"iii", kind:"guest", guest:"Kimia Nadjahi"},
  {n:13, title:"Extensions",                                       date:"Oct 14, 2025", section:"iii", kind:"own"},
  {n:14, title:"Riemannian Structure of W₂: Gradient Flows & Linearization", date:"Oct 16, 2025", section:"iii", kind:"guest", guest:"Katy Craig"},
  {n:15, title:"OT for Graph Representation: Unsupervised Learning, Prediction & Neural Solvers", date:"Oct 21, 2025", section:"iii", kind:"guest", guest:"Rémi Flamary"},
  {n:16, title:"Domain Adaptation: Old and New with Optimal Transport", date:"Oct 23, 2025", section:"iv", kind:"guest", guest:"Nicolas Courty"},
  {n:17, title:"Distributional Preference Alignment of LLMs via OT", date:"Nov 3, 2025", section:"iv", kind:"guest", guest:"Youssef Mroueh"},
  {n:18, title:"Optimal Transport and Flow Matching",              date:"Nov 6, 2025",  section:"iv", kind:"missing", guest:"Marco Cuturi"},
  {n:19, title:"Gromov-Wasserstein Alignment: Statistics, Computation & Geometry", date:"Nov 20, 2025", section:"iv", kind:"guest", guest:"Ziv Goldfeld"},
  {n:20, title:"Optimal Transport in Single Cell Biology", date:"Nov 25, 2025", section:"iv", kind:"missing", guest:"Pınar Demetçi"},
];

window.CS2840_SECTIONS = [
  {id:"i",   label:"§I  Fundamentals",      range:[1,4],   accent:"var(--accent-i)"},
  {id:"ii",  label:"§II  Computation",      range:[5,11],  accent:"var(--accent-ii)"},
  {id:"iii", label:"§III  Generalizations", range:[12,15], accent:"var(--accent-iii)"},
  {id:"iv",  label:"§IV  ML Applications",  range:[16,20], accent:"var(--accent-iv)"},
];
