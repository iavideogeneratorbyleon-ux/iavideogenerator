import React from 'react';
import WizardContainer from './components/wizard/WizardContainer';

export default function App() {
  return <WizardContainer />;
}


// export default function App() {
//   return (
//     <div className="min-h-screen bg-bg-main text-text-main flex flex-col items-center justify-center p-6 font-sans">
//       <div className="max-w-md w-full bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xl space-y-4">
        
//         {/* Badge de estado */}
//         <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-brand-primary/20">
//           <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
//           Cempasúchil Theme Activo
//         </div>

//         {/* Título y descripción */}
//         <h1 className="text-2xl font-extrabold tracking-tight text-text-main">
//           Asistente de IA para Video
//         </h1>
//         <p className="text-sm text-text-muted">
//           Interfaz adaptada para celular (Mobile-First). Colores y tipografía configurados correctamente mediante Tailwind.
//         </p>

//         {/* Acciones principales */}
//         <div className="pt-2 space-y-3">
//           <button className="w-full bg-brand-primary hover:bg-brand-hover text-text-main font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-brand-primary/20 cursor-pointer">
//             Crear mi primer video
//           </button>
          
//           <button className="w-full bg-bg-hover hover:bg-border-subtle text-text-muted font-medium py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer">
//             Ver galería de plantillas
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

