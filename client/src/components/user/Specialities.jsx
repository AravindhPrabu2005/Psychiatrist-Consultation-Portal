import React from 'react';

const specialities = [
     {
          title: 'Child Psychiatrist',
          img: 'https://th.bing.com/th/id/OIP.XDT8VxH4S9GesSDdfoODOAHaQe?w=157&h=350&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3'
     },
     {
          title: 'Addiction Psychiatrist',
          img: 'data:image/webp;base64,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'
     },
     {
          title: 'Geriatric Psychiatrist',
          img: 'https://as1.ftcdn.net/v2/jpg/07/13/36/92/1000_F_713369214_O221Yc0ViRpG9g8mi9vapmaqzr6OGwqv.jpg'
     },
     {
          title: 'Neuropsychiatrist',
          img: 'https://th.bing.com/th/id/OIP.lwGZnachk3cYf-cGkzextwHaHa?w=151&h=180&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3'
     },
     {
          title: 'Forensic Psychiatrist',
          img: 'https://thumbs.dreamstime.com/z/forensic-working-crime-scene-vector-illustration-forensics-62694874.jpg'
     },
     {
          title: 'Sleep Specialist',
          img: 'https://static.vecteezy.com/system/resources/previews/000/444/317/large_2x/vector-girl-sleeping-at-nighttime.jpg'
     }
];

export default function PsychiatristSpecialities() {
     return (
          <div className="text-center my-16 px-4 sm:px-10">
               <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Find by Speciality</h2>
               <p className="text-gray-600 text-sm sm:text-base mt-3">
                    Browse by psychiatrist specialization and book tailored sessions.
               </p>
               <div className="mt-10 flex flex-wrap justify-center gap-6">
                    {specialities.map((sp, i) => (
                         <div key={i} className="flex flex-col items-center">
                              <div key={i} className="flex flex-col items-center">
                                   <div className="bg-[#E5EDF9] p-1 rounded-full w-[100px] h-[100px] overflow-hidden flex items-center justify-center">
                                        <img src={sp.img} alt={sp.title} className="w-full h-full object-cover rounded-full" />
                                   </div>
                                   <p className="mt-3 text-sm sm:text-base text-[#1D1E20]">{sp.title}</p>
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     );
}
