import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, Info, X, ChevronRight, ChevronLeft, Search, Edit2, Copy, Save, ZoomIn, ZoomOut, RotateCcw, Move, MapPin, Layers, Plus } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { AnimatedTabIcon } from './AnimatedTabIcon';

interface Room {
  id: string;
  name: string;
  description?: string;
  color: string;
  floor: 1 | 2;
  // Grid positioning (using 12-column grid)
  col: string; // e.g. "span 3"
  row: string; // e.g. "span 2"
  colStart?: number;
  rowStart?: number;
}

const ROOMS: Room[] = [
  // --- FLOOR 1 ---
  { id: 'obas', name: 'OBAS', floor: 1, color: '#dcfce7', col: '7', row: '16', colStart: 8.2, rowStart: 14 },
  { id: 'obas-or', name: 'OBAS OR', floor: 1, color: '#fee2e2', col: '7', row: '7', colStart: 8.2, rowStart: 30.5 },
  { id: 'er', name: 'ER', floor: 1, color: '#dcfce7', col: '8.5', row: '18.5', colStart: 8.2, rowStart: 38.5 },
  { id: 'pedia-avr', name: 'Pedia AVR', floor: 1, color: '#fef3c7', col: '7', row: '11', colStart: 8.2, rowStart: 58 },
  { id: 'pedia-office', name: 'Pedia Office', floor: 1, color: '#fef3c7', col: '7', row: '11', colStart: 8.2, rowStart: 70 },
  { id: 'ward-15', name: 'Ward 15 (OB)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 17.2, rowStart: 14 },
  { id: 'imu', name: 'IMU', floor: 1, color: '#fef3c7', col: '5.5', row: '4.5', colStart: 30.2, rowStart: 23 },
  { id: 'ward-14a', name: 'Ward 14A (Trauma)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 17.2, rowStart: 26 },
  { id: 'er-xray', name: 'ER X-Ray', floor: 1, color: '#fee2e2', col: '7', row: '7', colStart: 20.2, rowStart: 41 },
  { id: 'radiology', name: 'Radiology', floor: 1, color: '#fee2e2', col: '15', row: '7', colStart: 20.2, rowStart: 48 },
  { id: 'ward-11', name: 'Ward 11 (Pedia)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 17.2, rowStart: 58 },
  { id: 'hema-onco', name: 'Hema Onco', floor: 1, color: '#fef3c7', col: '5.5', row: '4.5', colStart: 30.2, rowStart: 67 },
  { id: 'ward-9', name: 'Ward 9 (Pedia)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 17.2, rowStart: 71 },
  { id: 'hospital-kitchen', name: 'Hospital Kitchen', floor: 1, color: '#fef3c7', col: '19', row: '12', colStart: 39.2, rowStart: 14 },
  { id: 'pay-admitting', name: 'Pay Admitting', floor: 1, color: '#fef3c7', col: '19', row: '9', colStart: 39.2, rowStart: 29 },
  { id: 'elevators', name: 'Elevators', floor: 1, color: '#e2e8f0', col: '15', row: '11', colStart: 40.8, rowStart: 41 },
  { id: 'havu', name: 'HAVU', floor: 1, color: '#fee2e2', col: '6.5', row: '12', colStart: 42.2, rowStart: 58 },
  { id: 'guazon-hall', name: 'Guazon Hall', floor: 1, color: '#dcfce7', col: '5', row: '12', colStart: 49.2, rowStart: 58 },
  { id: 'mss', name: 'MSS', floor: 1, color: '#fef3c7', col: '4.5', row: '12', colStart: 54.8, rowStart: 64 },
  { id: 'toxicology', name: 'Toxicology', floor: 1, color: '#fee2e2', col: '15.5', row: '5', colStart: 38.2, rowStart: 71 },
  { id: 'atrium', name: 'Atrium', floor: 1, color: '#fee2e2', col: '23', row: '10', colStart: 37.8, rowStart: 79 },
  { id: 'ward-7', name: 'Ward 7 (Psych)', floor: 1, color: '#dcfce7', col: '19', row: '11', colStart: 61.2, rowStart: 14 },
  { id: 'ward-5', name: 'Ward 5 (Neuro Rehab)', floor: 1, color: '#dcfce7', col: '19', row: '11', colStart: 61.2, rowStart: 26 },
  { id: 'radio-ct-mri', name: 'Radio (CT, MRI)', floor: 1, color: '#fee2e2', col: '10', row: '6', colStart: 58.2, rowStart: 41 },
  { id: 'pharmacy', name: 'Central Block Pharmacy', floor: 1, color: '#fef3c7', col: '20', row: '6', colStart: 68.2, rowStart: 41 },
  { id: 'nuclear-med', name: 'Nuclear Medicine | ECG', floor: 1, color: '#fee2e2', col: '27', row: '6', colStart: 61.8, rowStart: 48 },
  { id: 'ward-3', name: 'Ward 3 (GenMed)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 61.2, rowStart: 58 },
  { id: 'micu', name: 'MICU', floor: 1, color: '#fef3c7', col: '3.5', row: '3', colStart: 61.2, rowStart: 69 },
  { id: 'ward-1', name: 'Ward 1 (GenMed)', floor: 1, color: '#dcfce7', col: '15', row: '11', colStart: 61.2, rowStart: 71 },
  { id: 'mala-sakit', name: 'Mala Sakit', floor: 1, color: '#fef3c7', col: '6.5', row: '5', colStart: 61.2, rowStart: 83 },
  { id: 'rehab-med', name: 'Rehab Medicine', floor: 1, color: '#fef3c7', col: '6.5', row: '23', colStart: 82.2, rowStart: 14 },
  { id: 'sojr', name: 'SOJR', floor: 1, color: '#dcfce7', col: '5.5', row: '16', colStart: 91.2, rowStart: 23 },
  { id: 'cancer-inst', name: 'Cancer Institute', floor: 1, color: '#dcfce7', col: '5.5', row: '16', colStart: 91.2, rowStart: 41 },
  { id: 'opd', name: 'OPD', floor: 1, color: '#dcfce7', col: '7.5', row: '28', colStart: 89.2, rowStart: 67 },
  { id: 'admin', name: 'Admin', floor: 1, color: '#fef3c7', col: '13', row: '5.5', colStart: 29.2, rowStart: 90 },
  { id: 'main-lobby', name: 'Main Lobby', floor: 1, color: '#fef3c7', col: '10.5', row: '5.5', colStart: 43.2, rowStart: 90 },
  { id: 'cashier', name: 'Cashier', floor: 1, color: '#fef3c7', col: '13', row: '5.5', colStart: 55.2, rowStart: 90 },
  { id: 'chapel', name: 'PGH Chapel', floor: 1, color: '#dcfce7', col: '18.5', row: '12', colStart: 69.8, rowStart: 83 },
  { id: 'ortho-skills', name: 'Ortho Skills Lab', floor: 1, color: '#fef3c7', col: '8.5', row: '8', colStart: 76.2, rowStart: 5 },
  { id: 'shpm', name: 'SHPM', floor: 1, color: '#fef3c7', col: '9', row: '8', colStart: 85.8, rowStart: 5 },

  // --- FLOOR 2 ---
  { id: 'ob-confe', name: 'OB Confe Room', floor: 2, color: '#fef3c7', col: '6', row: '6', colStart: 2.2, rowStart: 12 },
  { id: 'obgyn-office', name: 'OBGYN Office', floor: 2, color: '#fef3c7', col: '6', row: '8', colStart: 2.2, rowStart: 20 },
  { id: 'obgyn-call', name: 'OBGYN Call Room', floor: 2, color: '#fef3c7', col: '6', row: '6', colStart: 2.2, rowStart: 30 },
  { id: 'ward-16', name: 'Ward 16 (OB Gyne Ward)', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 10.2, rowStart: 12 },
  { id: 'ward-14b', name: 'Ward 14B (Gyne Ward)', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 10.2, rowStart: 25 },
  { id: 'dietary-hall', name: 'Dietary Hall / Mess Hall', floor: 2, color: '#fef3c7', col: '20', row: '11', colStart: 40.2, rowStart: 12 },
  { id: 'nutrition', name: 'Nutrition', floor: 2, color: '#fef3c7', col: '20', row: '6', colStart: 40.2, rowStart: 25 },
  { id: 'ward-8', name: 'Ward 8 (Ortho)', floor: 2, color: '#dcfce7', col: '20', row: '11', colStart: 70.2, rowStart: 12 },
  { id: 'ward-6', name: 'Ward 6 (Medicine)', floor: 2, color: '#dcfce7', col: '20', row: '11', colStart: 70.2, rowStart: 25 },
  { id: 'spine-bldg', name: 'Spine Bldg', floor: 2, color: '#fef3c7', col: '25', row: '5', colStart: 70.2, rowStart: 2 },
  { id: 'hicu', name: 'HICU', floor: 2, color: '#fef3c7', col: '5', row: '4', colStart: 8.2, rowStart: 41 },
  { id: 'mrl', name: 'MRL', floor: 2, color: '#fef3c7', col: '4', row: '4', colStart: 14.2, rowStart: 41 },
  { id: 'tb-dots', name: 'TB DOTS', floor: 2, color: '#fef3c7', col: '4', row: '4', colStart: 3.2, rowStart: 41 },
  { id: 'central-labs-1', name: 'Central Labs (Top)', floor: 2, color: '#fee2e2', col: '12', row: '5', colStart: 20.2, rowStart: 41 },
  { id: 'central-labs-2', name: 'Central Labs (Mid)', floor: 2, color: '#fee2e2', col: '13', row: '3', colStart: 20.2, rowStart: 47 },
  { id: 'central-labs-3', name: 'Central Labs (Bottom)', floor: 2, color: '#fee2e2', col: '11', row: '8', colStart: 20.2, rowStart: 51 },
  { id: 'sagip', name: 'SAGIP', floor: 2, color: '#fef3c7', col: '11', row: '8', colStart: 6.2, rowStart: 46 },
  { id: 'blood-bank', name: 'Blood Bank', floor: 2, color: '#fee2e2', col: '8', row: '4', colStart: 6.2, rowStart: 50 },
  { id: 'elevators-2', name: 'Elevators / Stairs', floor: 2, color: '#e2e8f0', col: '10', row: '16', colStart: 45.2, rowStart: 38 },
  { id: 'equilife', name: 'Equilife/CCUMAT', floor: 2, color: '#fef3c7', col: '14', row: '4', colStart: 60.2, rowStart: 43 },
  { id: 'abg-2', name: 'ABG', floor: 2, color: '#fee2e2', col: '10', row: '5', colStart: 64.2, rowStart: 49 },
  { id: 'cenicu', name: 'CENICU', floor: 2, color: '#fef3c7', col: '20', row: '18', colStart: 78.2, rowStart: 40 },
  { id: 'devped-2', name: 'DEVPED', floor: 2, color: '#fef3c7', col: '8', row: '15', colStart: 2.2, rowStart: 60 },
  { id: 'ward-12', name: 'Ward 12 (Semi-private)', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 10.2, rowStart: 60 },
  { id: 'ward-10', name: 'Ward 10 (ORL)', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 10.2, rowStart: 73 },
  { id: 'orl-confe', name: 'ORL Confe Room', floor: 2, color: '#fef3c7', col: '7', row: '6', colStart: 2.2, rowStart: 76 },
  { id: 'burn-unit', name: 'Burn Unit', floor: 2, color: '#dcfce7', col: '14', row: '13', colStart: 40.2, rowStart: 65 },
  { id: 'ear-unit', name: 'Ear Unit', floor: 2, color: '#fef3c7', col: '7', row: '5', colStart: 40.2, rowStart: 72 },
  { id: 'ward-4', name: 'Ward 4 (Surgery) / SICU', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 75.2, rowStart: 60 },
  { id: 'ward-2', name: 'Ward 2 (Surgery)', floor: 2, color: '#dcfce7', col: '15', row: '11', colStart: 75.2, rowStart: 73 },
  { id: 'gs2', name: 'GS2', floor: 2, color: '#fef3c7', col: '6', row: '5', colStart: 92.2, rowStart: 60 },
  { id: 'gs3', name: 'GS3', floor: 2, color: '#fef3c7', col: '6', row: '5', colStart: 92.2, rowStart: 66 },
  { id: 'gs1', name: 'GS1', floor: 2, color: '#fef3c7', col: '6', row: '5', colStart: 92.2, rowStart: 72 },
  { id: 'surg-office', name: 'Surg Office', floor: 2, color: '#fef3c7', col: '6', row: '7', colStart: 92.2, rowStart: 78 },
  { id: 'it-office', name: 'IT Office', floor: 2, color: '#fef3c7', col: '7', row: '5', colStart: 68.2, rowStart: 85 },
];

const PghMapTab: React.FC = () => {
  const [floor, setFloor] = useState<1 | 2>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roomsData, setRoomsData] = useState<Room[]>(() => {
    const saved = localStorage.getItem('pgh_rooms_data');
    return saved ? JSON.parse(saved) : ROOMS;
  });

  useEffect(() => {
    localStorage.setItem('pgh_rooms_data', JSON.stringify(roomsData));
  }, [roomsData]);

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const floor1Image = `${import.meta.env.BASE_URL}pgh_f1.png`;
  const floor2Image = `${import.meta.env.BASE_URL}pgh_f2.png`;

  const currentMapImage = floor === 1 ? floor1Image : floor2Image;

  const filteredRooms = roomsData.filter(r => 
    r.floor === floor && 
    (searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRoomUpdate = (id: string, field: keyof Room, value: any) => {
    setRoomsData(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(roomsData, null, 2);
    navigator.clipboard.writeText(json);
    alert('Coordinates copied to clipboard! You can now paste them to the chat.');
  };

  const editingRoom = roomsData.find(r => r.id === editingRoomId);

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'New Room',
      floor: floor,
      color: '#fef3c7',
      col: '10',
      row: '10',
      colStart: 45,
      rowStart: 45
    };
    setRoomsData(prev => [...prev, newRoom]);
    setEditingRoomId(newRoom.id);
  };

  const deleteRoom = (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRoomsData(prev => prev.filter(r => r.id !== id));
      setEditingRoomId(null);
    }
  };

  const SearchBar = ({ className }: { className?: string }) => (
    <div className={className}>
      <div className="relative pointer-events-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search for a ward, unit, or office..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 bg-white rounded-lg border-none focus:outline-none transition-all text-sm"
        />
      </div>
    </div>
  );

  const UtilityControls = ({ className, buttonClassName }: { className?: string; buttonClassName?: string }) => (
    <div className={className || "flex gap-1"}>
      {isEditMode && (
        <button
          onClick={addRoom}
          className={`p-2 bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 transition-all ${buttonClassName || ''}`}
          title="Add New Room"
        >
          <Plus size={18} />
        </button>
      )}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className={`p-2.5 rounded-full transition-all ${buttonClassName || ''} ${
          isEditMode ? 'bg-blue-500 text-white' : 'bg-[#334155] text-white hover:bg-[#475569]'
        }`}
        title="Toggle Edit Mode"
      >
        <Edit2 size={20} />
      </button>
      
      <button
        onClick={() => setShowCoordinates(!showCoordinates)}
        className={`p-2.5 rounded-full transition-all ${buttonClassName || ''} ${
          showCoordinates ? 'bg-amber-500 text-white' : 'bg-[#334155] text-white hover:bg-[#475569]'
        }`}
        title="Toggle Coordinate Helper"
      >
        <Info size={20} />
      </button>

      {isEditMode && (
        <button
          onClick={copyToClipboard}
          className={`p-2 bg-green-500 border border-green-600 text-white transition-all hover:bg-green-600 ${buttonClassName || ''}`}
          title="Copy Coordinates JSON"
        >
          <Copy size={18} />
        </button>
      )}
    </div>
  );

  return (
    <div id="second-tool" className="tool-content active h-full flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.1}
          maxScale={10}
          centerOnInit={true}
          disabled={isEditMode}
          limitToBounds={false}
          panning={{ velocityDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Mobile Search (Outside map) */}
              <div className="md:hidden mb-2 px-2">
                <SearchBar className="bg-white border border-slate-200 shadow-sm" />
              </div>

              {/* Map Container - The "Box" */}
              <div className="input-section !p-0 flex flex-col flex-1 overflow-hidden transition-all duration-300 relative border border-slate-200 shadow-sm min-h-0">
                <div className="flex flex-col h-full">
                  <div className="flex-1 relative overflow-hidden bg-slate-50">
                    {/* Desktop/Tablet Toolbox (Inside map) - Box-less design */}
                    <div className="hidden md:block absolute inset-0 z-50 pointer-events-none p-6">
                      {/* Top Left: Search Bar */}
                      <div className="absolute top-6 left-6 w-full max-w-md pointer-events-auto">
                        <SearchBar className="bg-white rounded-lg shadow-xl border border-slate-100" />
                      </div>
                      
                      {/* Top Right: Floor Selection */}
                      <div className="absolute top-6 right-6 flex gap-2 pointer-events-auto">
                        {[1, 2].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFloor(f as 1 | 2)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xl ${
                              floor === f
                                ? 'bg-[#334155] text-white scale-110'
                                : 'bg-[#475569] text-white/80 hover:bg-[#334155] hover:text-white'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Middle Right: Zoom & Utility Controls */}
                      <div className="absolute top-24 right-6 flex flex-col gap-3 pointer-events-auto">
                        {/* Zoom Controls */}
                        <div className="flex flex-col gap-2">
                          <button onClick={() => zoomIn()} className="p-3 bg-[#334155] rounded-full shadow-xl text-white hover:bg-[#475569] transition-all active:scale-95"><ZoomIn size={20} /></button>
                          <button onClick={() => zoomOut()} className="p-3 bg-[#334155] rounded-full shadow-xl text-white hover:bg-[#475569] transition-all active:scale-95"><ZoomOut size={20} /></button>
                          <button onClick={() => resetTransform()} className="p-3 bg-[#334155] rounded-full shadow-xl text-white hover:bg-[#475569] transition-all active:scale-95"><RotateCcw size={20} /></button>
                        </div>

                        {/* Utility Controls */}
                        <UtilityControls className="flex flex-col gap-2" buttonClassName="shadow-xl !p-3" />
                      </div>
                    </div>

                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                      <div className="relative inline-block h-full cursor-grab active:cursor-grabbing">
                        <img 
                          src={currentMapImage} 
                          alt={`PGH Floor ${floor}`}
                          className="h-full w-auto block object-contain"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Interactive Hotspots Overlay */}
                        <div className="absolute inset-0">
                          {filteredRooms.map((room) => (
                            <motion.button
                                key={room.id}
                                initial={{ opacity: 0 }}
                                animate={{ 
                                  opacity: (showCoordinates || isEditMode || searchQuery) ? 0.6 : 0,
                                  backgroundColor: editingRoomId === room.id ? 'rgba(59, 130, 246, 0.4)' : (searchQuery && room.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'rgba(51, 65, 85, 0.2)' : 'rgba(0,0,0,0)'),
                                  borderColor: editingRoomId === room.id ? '#3b82f6' : (showCoordinates ? '#f59e0b' : (searchQuery && room.name.toLowerCase().includes(searchQuery.toLowerCase()) ? '#334155' : 'rgba(0,0,0,0)'))
                                }}
                                whileHover={{ opacity: 0.8, backgroundColor: 'rgba(59, 130, 246, 0.2)', scale: 1.02 }}
                                onClick={() => {
                                  if (isEditMode) {
                                    setEditingRoomId(room.id);
                                  } else {
                                    setSelectedRoom(room);
                                  }
                                }}
                                className={`absolute border-2 transition-all z-10 rounded-[2px] flex items-center justify-center overflow-hidden ${
                                  (showCoordinates || isEditMode || searchQuery) ? '' : 'border-transparent'
                                }`}
                                style={{
                                  left: `${room.colStart}%`,
                                  top: `${room.rowStart}%`,
                                  width: `${room.col}%`,
                                  height: `${room.row}%`,
                                }}
                              >
                                {(searchQuery && room.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      opacity: [0.6, 1, 0.6]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-blue-600"
                                  >
                                    <MapPin size={Math.min(24, Math.max(12, Number(room.col) * 5))} fill="currentColor" fillOpacity={0.4} />
                                  </motion.div>
                                )}
                                {selectedRoom?.id === room.id && (
                                  <motion.div
                                    layoutId="selected-room-indicator"
                                    className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  />
                                )}
                                {(showCoordinates || isEditMode) && (
                                  <span className={`absolute -top-5 left-0 text-white text-[8px] px-1 rounded-none whitespace-nowrap ${
                                    editingRoomId === room.id ? 'bg-blue-600' : 'bg-amber-600'
                                  }`}>
                                    {room.name}
                                  </span>
                                )}
                              </motion.button>
                            ))}

                          {/* Coordinate Helper Overlay */}
                          {(showCoordinates || isEditMode) && (
                            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-500/30">
                              <div className="absolute top-0 left-0 p-2 bg-amber-600 text-white text-xs font-mono rounded-none z-50">
                                {isEditMode ? 'EDIT MODE ACTIVE' : 'COORDINATE MODE ACTIVE'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TransformComponent>
                  </div>
                </div>
              </div>

              {/* Mobile Simplified Action Bar (Outside map) */}
              <div className="md:hidden mt-3 bg-white border border-slate-200 shadow-md p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {[1, 2].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFloor(f as 1 | 2)}
                        className={`w-11 h-11 flex items-center justify-center font-bold text-sm transition-all border-2 ${
                          floor === f
                            ? 'bg-[#334155] text-white border-[#334155] shadow-md'
                            : 'bg-white text-[#334155] border-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1 bg-slate-50 p-1 border border-slate-100">
                    <button onClick={() => zoomIn()} className="p-2.5 text-slate-600 active:bg-slate-200 transition-colors"><ZoomIn size={20} /></button>
                    <button onClick={() => zoomOut()} className="p-2.5 text-slate-600 active:bg-slate-200 transition-colors"><ZoomOut size={20} /></button>
                    <button onClick={() => resetTransform()} className="p-2.5 text-slate-600 active:bg-slate-200 transition-colors"><RotateCcw size={20} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <UtilityControls className="flex gap-2" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Floor {floor}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

        {/* Edit Panel Overlay */}
        {isEditMode && editingRoom && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] p-4 bg-white/95 backdrop-blur-md border border-blue-200 shadow-2xl w-full max-w-2xl"
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-xs font-bold text-blue-800 mb-1">Editing: {editingRoom.name}</h4>
                <input 
                  type="text" 
                  value={editingRoom.name} 
                  onChange={(e) => handleRoomUpdate(editingRoom.id, 'name', e.target.value)}
                  className="w-full p-1.5 text-xs border border-blue-300 rounded-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Room Name"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-blue-700 uppercase">Left (%)</label>
                  <input 
                    type="number" 
                    value={editingRoom.colStart} 
                    onChange={(e) => handleRoomUpdate(editingRoom.id, 'colStart', Number(e.target.value))}
                    className="w-16 p-1.5 text-xs border border-blue-300 rounded-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-blue-700 uppercase">Top (%)</label>
                  <input 
                    type="number" 
                    value={editingRoom.rowStart} 
                    onChange={(e) => handleRoomUpdate(editingRoom.id, 'rowStart', Number(e.target.value))}
                    className="w-16 p-1.5 text-xs border border-blue-300 rounded-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-blue-700 uppercase">Width (%)</label>
                  <input 
                    type="number" 
                    value={editingRoom.col} 
                    onChange={(e) => handleRoomUpdate(editingRoom.id, 'col', e.target.value)}
                    className="w-16 p-1.5 text-xs border border-blue-300 rounded-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-blue-700 uppercase">Height (%)</label>
                  <input 
                    type="number" 
                    value={editingRoom.row} 
                    onChange={(e) => handleRoomUpdate(editingRoom.id, 'row', e.target.value)}
                    className="w-16 p-1.5 text-xs border border-blue-300 rounded-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => deleteRoom(editingRoom.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-200"
                >
                  Delete
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset ALL coordinates to defaults?')) {
                      setRoomsData(ROOMS);
                      localStorage.removeItem('pgh_rooms_data');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setEditingRoomId(null)}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div 
                className="h-32 flex items-end p-6 relative"
                style={{ backgroundColor: selectedRoom.color }}
              >
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-none transition-colors text-slate-800"
                >
                  <X size={20} />
                </button>
                <h3 className="text-2xl font-bold text-slate-800">{selectedRoom.name}</h3>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                  <MapIcon size={16} />
                  <span>Floor {selectedRoom.floor}</span>
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-8">
                  {selectedRoom.description || "Detailed information about this area will be added soon. This section will include operating hours, contact numbers, and specific instructions for patients and staff."}
                </p>

                <button
                  onClick={() => setSelectedRoom(null)}
                  className="w-full py-4 bg-[#334155] text-white rounded-none font-bold shadow-lg hover:bg-[#475569] transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PghMapTab;
