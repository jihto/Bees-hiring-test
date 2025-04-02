import { useState } from 'react'  
import Task1 from './containers/Task1'; 
import BeesIcon from '../src/assets/images/icon-bees.svg';
function App() { 
  const [activeTab, setActiveTab] = useState(1);
  const tabs = [
    { id: 1, title: "Bài 1" },
    { id: 2, title: "Bài 2"},
  ];
  return (
    <div className='max-w-[1440px] mx-auto'>
      <div className='py-4'> 
        <div className='flex justify-start gap-2 items-center mb-6'>
          <img src={BeesIcon} className='w-10 h-10'/>
          <div className='w-[2px] h-5 rounded-[500px] bg-black'></div>
          <h4 className='uppercase text-2xl'>Bees</h4>
        </div>
        <h2 className='text-3xl'>Frontend Developer Hiring Test</h2>
      </div>
      <div className="w-full "> 
        <div className="relative flex space-x-4 border-b-2 border-gray-300">
          <div className='flex justify-between w-full'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative py-2 px-4 text-center text-lg font-semibold ${
                  activeTab === tab.id ? "text-blue-500" : "text-gray-500"
                } transition-all`}
              >
                {tab.title}
              </button>
            ))}
          </div> 
          <div
            className="absolute bottom-0 h-1 bg-blue-500 transition-all duration-300"
            style={{
              width: "50%", 
              left: activeTab === 1 ? "0%" : "50%",  
            }}
          />
        </div> 
      </div>
        <div className="mt-4 p-4 border-[1px] border-gray-100 rounded-md shadow">
          {
            activeTab === 1 
              ? <Task1 />
              : null
          } 
        </div>
    </div>
  )
}

export default App
