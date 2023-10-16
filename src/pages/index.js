// import { Inter } from 'next/font/google'
// import { usePDF } from 'react-to-pdf';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import axios from 'axios';
// import { useEffect, useRef, useState } from 'react';
// const inter = Inter({ subsets: ['latin'] })

// export default function Home() {

// const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
// const additionalContentRef = useRef();
// const [crimeData, setCrimeData] = useState(null);
// const [data, setData] = useState([]);
// const [selectedOption, setSelectedOption] = useState();

// const handleDownloadPDF = () => {
//   // Call toPDF on targetRef with the additional content
//   toPDF(targetRef, additionalContentRef);
// };

// useEffect(() => {
//   // Make the Axios GET request when the component mounts
//   axios.get("https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv")
//     .then((response) => {
//       // Assuming the response data is in JSON format
//       console.log(response.data.keys[0])
//       setCrimeData(response.data.data);
//       setData(response.data.keys)
//       setSelectedOption(response.data.keys[0])
//     })
//     .catch((error) => {
//       console.error('Error fetching data:', error);
//     });
// }, []);

// const handleOptionChange = (e) => {
//   setSelectedOption(e.target.value);
// };

//   return (
//     <main
//       className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
//     >
//       <p className='text-[28px]'>Pdf generator</p>
//       <div>
//           <select value={selectedOption} onChange={handleOptionChange} className='border-black border-[1px] rounded'>
//             {data.map((option, index) => (
//               <option key={index} value={option}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>
//      <button onClick={handleDownloadPDF}>Download PDF</button>
//          <div ref={targetRef} className='pt-10 px-12 border-2 border-red-300'>
//           <div className='bg-[#E8EEFB] pt-4  rounded-[16px]'>
//             <p className='text-[#1463FF] ml-4 mb-2'>{selectedOption}</p>
//            <div className='bg-[#F2F4F5] p-8 rounded-b-[16px] flex '>
//             <div className='my-auto -rotate-90 -ml-8'>
//               Arrests
//             </div>
//             <div className=' bg-white rounded-[12px]'>
//               <LineChart width={600} height={300} data={crimeData} margin={{ top: 20, right: 24, bottom: 20, left: 0 }}>
//                 <XAxis dataKey="data_year" />
//                 <YAxis />
//                 <CartesianGrid stroke="#eee" horizontal={true} />
//                 <Line type="monotone" dataKey={selectedOption} stroke="#8884d8" />
//                 <Tooltip />
//               </LineChart>
//               </div>
//             </div>
//             </div>
//          </div>
//     </main>
//   )
// }

import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOMServer from 'react-dom/server'; // Import the server-side rendering library
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const targetRef = useRef();
  const [crimeData, setCrimeData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedOption, setSelectedOption] = useState();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    axios
      .get(
        "https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv"
      )
      .then((response) => {
        console.log(response.data.keys[0]);
        setCrimeData(response.data.data);
        setData(response.data.keys);
        setSelectedOption(response.data.keys[0]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  // Define your complex UI components as React components
  const MyHeader = () => {
    return (
      <div className=' w-[190px]'>
        <div className="flex justify-between mb-2 ">
          <p style={{ fontSize: '4px' }}>RealAssist.Ai</p>
          <p style={{ fontSize: '4px' }}>123 Main Street, Dover, NH 03820-4667</p>
        </div>
        <hr class="w-full border-none bg-blue-400 h-[2px]"></hr>
      </div>
    );
  };
  
  const MyFooter = ({ pageNumber }) => {
    
    return (
      <div className=' w-[190px]'>
        <hr class="w-full border-none bg-blue-400 h-[2px]"></hr>
        <div className="flex justify-between">
          <p style={{ fontSize: '4px' }}>{currentDate.toLocaleDateString()}</p>
          <p style={{ fontSize: '4px' }}>Showing Page {1} of {data.length+1}</p>
        </div>
      </div>
    );
  };

 const handleDownloadPDF = () => {
  const footerHeight = 10; // Footer height
  const pdf = new jsPDF('p', 'mm', 'a4');
  let currentIndex = 0; // Track the current index in the data array

  const addPageWithHeaderFooter = (key, index) => {
    // Convert React components to HTML using ReactDOMServer
    const headerHTML = ReactDOMServer.renderToStaticMarkup(<MyHeader />);
    const footerHTML = ReactDOMServer.renderToStaticMarkup(<MyFooter pageNumebr={currentIndex} />);

    // Create a new chart for the current key
    const currentKey = key;
    setSelectedOption(currentKey);

    // Add a new chart for the current key
    const chartNode = targetRef.current;
    html2canvas(chartNode)
      .then((chartCanvas) => {
        const chartImgData = chartCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.html(headerHTML, {
          x: 5,
          w: pdf.internal.pageSize.width - 20, // Set the width to match the page width minus 20mm for padding
        });
        // Add the captured image in the middle
        pdf.addImage(chartImgData, 'PNG', 10, 20, pdf.internal.pageSize.width - 20, 0);

        // Add footer component at the bottom
        pdf.html(footerHTML, {
          x: 5,
          y: pdf.internal.pageSize.height - footerHeight - 20,
          w: pdf.internal.pageSize.width - 20, // Set the width to match the page width minus 20mm for padding
          callback: function () {
            if (index < data.length - 1) {
              // Continue to the next key
              addPageWithHeaderFooter(data[index + 1], index + 1);
            } else {
              // If all keys have been processed, save the PDF
              pdf.save('page.pdf');
            }
          },
        });
      })
      .catch((error) => {
        console.error('Error capturing chart:', error);
      });
  };

  // Start the process with the first key in the data array
  addPageWithHeaderFooter(data[currentIndex], currentIndex);
};

  
  
  

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}>
      <p className="text-[28px] mb-2">Pdf generator</p>
      <div>
        <select value={selectedOption} onChange={handleOptionChange} className="border-black border-[1px] rounded">
          {data.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleDownloadPDF}>Download PDF </button>
      <div ref={targetRef} className="pt-10">
        <div className="bg-[#E8EEFB] pt-4  rounded-[16px]">
          <p className="text-[#1463FF] ml-4 mb-2">{selectedOption}</p>
          <div className="bg-[#F2F4F5] p-8 rounded-b-[16px] flex ">
            <div className="my-auto -rotate-90 -ml-8">Arrests</div>
            <div className="bg-white rounded-[12px]">
              <LineChart width={600} height={300} data={crimeData} margin={{ top: 20, right: 24, bottom: 20, left: 0 }}>
                <XAxis dataKey="data_year" />
                <YAxis />
                <CartesianGrid stroke="#eee" horizontal={true} />
                <Line type="monotone" dataKey={selectedOption} stroke="#8884d8" />
                <Tooltip />
              </LineChart>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
