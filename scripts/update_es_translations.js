const fs=require('fs'); const path=require('path');
const file=path.resolve(__dirname, '..', 'messages', 'es.json');
const obj=JSON.parse(fs.readFileSync(file,'utf8'));
function setPath(o, pathStr, value){ const parts=pathStr.split('.'); let cur=o; for(let i=0;i<parts.length-1;i++){ const p=parts[i]; if(!(p in cur) || typeof cur[p] !== 'object') cur[p]={}; cur=cur[p]; } cur[parts[parts.length-1]] = value; }
const updates = {
  'nav.dashboard': 'Panel de Control',
  'auth.email': 'Correo electrónico',
  'auth.submitting': 'Enviando...',
  'routineForm.manual': 'Manual',
  'routineForm.imageLabel': 'Imagen (opcional)',
  'routineForm.imageUploadClick': 'Haz clic para subir una imagen',
  'routineForm.imageFormats': 'JPG, PNG o GIF',
  'routineForm.equipmentLabel': 'Equipamiento',
  'routineForm.equipmentPlaceholder': 'Seleccionar equipamiento (opcional)',
  'routineForm.copySetTitle': 'Copiar serie',
  'routineForm.removeSetTitle': 'Eliminar serie',
  'routineForm.addSet': 'Añadir serie',
  'routineForm.selectExercisesTitle': 'Seleccionar Ejercicios',
  'routineForm.saving': 'Guardando...',
  'routineForm.createSuccess': 'Rutina creada exitosamente',
  'routineForm.updateSuccess': 'Rutina actualizada exitosamente',
  'routineForm.saveError': 'Error al guardar la rutina. Por favor intenta de nuevo.',
  'routineForm.imagePreviewAlt': 'Vista previa',
  'routineForm.removeExercise': 'Eliminar',
  'dashboard.notApplicable': 'No aplica',
  'dashboard.units.kg': 'kg',
  'dashboard.volumeChart.total': 'Total',
  'dashboard.muscleGroupStats.kgTotal': 'kg Total',
  'dashboard.personalRecords.rmShort': '1RM',
  'dashboard.strengthProgression.rmDefinition': '1RM (Una Repetición Máxima): Es el peso máximo que podrías levantar en una sola repetición. Se estima usando la fórmula de Epley basada en tus mejores series.',
  'dashboard.progressDashboard.exerciseProgress.reps': 'repeticiones',
  'dashboard.progressDashboard.tipTitle': 'Consejo:',
  'volumeChart.total': 'Total',
  'muscleGroupStats.kgTotal': 'kg Total',
  'personalRecords.rmShort': '1RM',
  'strengthProgression.rmDefinition': '1RM (Una Repetición Máxima): Es el peso máximo que podrías levantar en una sola repetición. Se estima usando la fórmula de Epley basada en tus mejores series.',
  'progressDashboard.exerciseProgress.reps': 'repeticiones',
  'progressDashboard.tipTitle': 'Consejo:'
};
for(const k of Object.keys(updates)) setPath(obj,k,updates[k]);
fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
console.log('UPDATED');
