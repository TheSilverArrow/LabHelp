import React, { useState, useEffect } from 'react';
import { LabRequest, MaterialDetail, Reminder } from '../types';
import { extractLabData } from '../services/gemini';
import LabForm from './LabForm';
import { CUP_SPECIMENS, getParsedLookup, LookupEntry } from '../constants';
import { AnimatedTabIcon } from './AnimatedTabIcon';

const TalongTab: React.FC = () => {
  const [unstructured, setUnstructured] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualBirthday, setManualBirthday] = useState('');
  const [manualAge, setManualAge] = useState('');
  const [manualSex, setManualSex] = useState('');
  const [manualCN, setManualCN] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualLabs, setManualLabs] = useState('');
  const [showLookup, setShowLookup] = useState(false);
  const [lookupSearch, setLookupSearch] = useState('');
  const [forms, setForms] = useState<LabRequest[]>([]);
  const [collector, setCollector] = useState(localStorage.getItem('pgh_collector_name') || '');
  const [timeCollected, setTimeCollected] = useState('');
  const [isEr, setIsEr] = useState(localStorage.getItem('pgh_er_override') === 'true');
  const [showFullGenerator, setShowFullGenerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Record<string, MaterialDetail>>({});
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    localStorage.setItem('pgh_collector_name', collector);
  }, [collector]);

  useEffect(() => {
    localStorage.setItem('pgh_er_override', String(isEr));
  }, [isEr]);

  const getCurrentDateMMDD = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  const handleAutoFill = async () => {
    if (!unstructured.trim()) return;
    setLoading(true);
    try {
      const data = await extractLabData(unstructured, collector, getCurrentDateMMDD());
      if (data && data.length > 0) {
        const first = data[0];
        setManualName(first.name || '');
        setManualBirthday(first.birthday || '');
        
        const ageSex = first.age_sex || '';
        // Use a more robust extraction for age and sex
        let extractedAge = '';
        let extractedSex = '';
        
        const cleanedAgeSex = ageSex.toLowerCase().replace(/years old|yo|y\/o|yrs|yr/g, '').trim();
        if (cleanedAgeSex.includes('/')) {
          const parts = cleanedAgeSex.split('/');
          extractedAge = parts[0].trim();
          extractedSex = parts[1].trim().toUpperCase();
        } else if (cleanedAgeSex.includes(',')) {
          const parts = cleanedAgeSex.split(',');
          extractedAge = parts[0].trim();
          extractedSex = parts[1].trim().toUpperCase();
        } else {
          const ageMatch = cleanedAgeSex.match(/(\d+)/);
          const sexMatch = cleanedAgeSex.match(/(M|F)/i);
          extractedAge = ageMatch ? ageMatch[1] : '';
          extractedSex = sexMatch ? sexMatch[1].toUpperCase() : '';
        }
        
        setManualAge(extractedAge);
        setManualSex(extractedSex);
        
        setManualCN(first.case_number || '');
        setManualLocation(first.ward_location || '');
        
        // Combine all requests_list from all forms into one string for the manualLabs box
        const allLabs = data.map(item => item.requests_list).filter(Boolean).join('\n');
        setManualLabs(allLabs);

        const newForms: LabRequest[] = data.map(item => {
          const form: LabRequest = {
            name: item.name || '',
            ward_location: item.ward_location || '',
            age_sex: item.age_sex || '',
            birthday: item.birthday || '',
            case_number: item.case_number || '',
            diagnosis: item.diagnosis || '',
            requested_by: item.requested_by || '',
            date_collected: item.date_collected || '',
            time_collected: item.time_collected || '',
            collected_by: item.collected_by || '',
            specimen_type: item.specimen_type || '',
            site_of_collection: item.site_of_collection || '',
            form_type: item.form_type || '',
            tube_top: item.tube_top || '',
            requests_list: item.requests_list || ''
          };
          if (isEr) form.ward_location = "ER";
          if (timeCollected) form.time_collected = timeCollected;
          if (collector) form.collected_by = collector.toUpperCase();
          return form;
        });
        setForms(newForms);
        calculateMaterialsAndReminders(newForms);
      }
    } catch (error) {
      console.error(error);
      alert("Error extracting data. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lookup = getParsedLookup();
    const rawLines = manualLabs.split(/[\n,]/).map(l => l.trim()).filter(l => l !== '');
    const lines: string[] = [];
    
    const aliases: Record<string, string[]> = {
      'na': ['sodium'], 'k': ['potassium'], 'cl': ['chloride'], 'ca': ['calcium'],
      'mg': ['magnesium'], 'phos': ['phosphorus', 'po4'], 'fbs': ['sugar', 'glucose', 'rbs'],
      'rbs': ['random blood sugar', 'rbs'],
      'bua': ['uric acid', 'blood uric acid', 'blooduricacid'], 'crea': ['creatinine'], 'urinalysis': ['ua'],
      'fecalysis': ['stool exam', 'stool analysis'], 'cbc': ['complete blood count'],
      'pt': ['prothrombin time', 'protime', 'inr'],
      'ptt': ['partial thromboplastin time', 'aptt'],
      'tpag': ['albumin globulin'], 'trop i': ['troponin'], 'hba1c': ['glycated hemoglobin', 'a1c'],
      'tsh': ['thyroid stimulating hormone'], 'lipid profile': ['lipid panel', 'nonfasting lp'],
      'ogtt': ['glucose tolerance'], 'blood cs': ['bcs', 'blood culture & sensitivity'],
      'coombs test': ['direct coombs', 'indirect coombs', 'coombs'],
      'tb': ['total bilirubin', 'totalbilirubin'], 'db': ['direct bilirubin', 'directbilirubin'], 'ib': ['indirect bilirubin', 'indirectbilirubin'],
      'c3': ['complement 3'], 'anti-dsdna': ['dsdna', 'anti dsdna'],
      'ua rbc morph': ['urine rbc morphology', 'rbc morphology', 'urine rbc morph'],
      'anti-hcv': ['hcv', 'anti hcv'],
      'anti-hbs': ['hbs', 'anti hbs'],
      'anti-hbc total': ['hbc total', 'anti hbc total'],
      '25-hydroxy vit d': ['vit d', 'vitd', 'vitamin d'],
      'nh3': ['ammonia'],
      'tb quantiferon': ['quantiferon', 'tb quant'],
      'blood typing': ['blood type', 'bt', 'bloodtyping'],
      'bt': ['blood type', 'blood typing', 'bloodtyping'],
      'mtb-rif (sputum)': ['sputum mtbrif', 'mtb-rif', 'mtb rif'],
      'genexpert (sputum)': ['genexpert sputum', 'gene xpert sputum', 'sputum genexpert'],
      'gs/cs (sputum)': ['sputum gscs', 'gscs sputum', 'sputum gs/cs', 'sputum gs cs', 'gscs', 'gs/cs', 'gs cs', 'culture and sensitivity'],
      'tsh (thyroid stimulating hormone)': ['tsh', 'thyroid stimulating hormone'],
      'ft3 (free triiodothyronine)': ['ft3', 'free triiodothyronine'],
      'ft4 (free thyroxine)': ['ft4', 'free thyroxine'],
      'anti-tpo (anti-thyroid peroxidase antibody)': ['anti-tpo', 'tpo', 'anti-thyroid peroxidase antibody'],
      '17-ohp (17a-hydroxyprogesterone)': ['17-ohp', '17a-hydroxyprogesterone'],
      'trab (tsh receptor antibody)': ['trab', 'tsh receptor antibody'],
      'hgh (growth hormone)': ['hgh', 'growth hormone'],
      'igf-1 (insulin-like growth factor 1)': ['igf-1', 'insulin-like growth factor 1'],
      'acth (adrenocorticotropic hormone)': ['acth', 'adrenocorticotropic hormone'],
      'fsh': ['follicle-stimulating hormone'],
      'lh': ['luteinizing hormone'],
      'dhea-s': ['dehydroepiandrosterone', 'dheas'],
      'ipth': ['pth', 'parathyroid hormone'],
      'bhcg': ['hcg', 'human chorionic gonadotropin'],
      '4plex test': ['4plex', 'sars-cov-2', 'influenza', 'rsv'],
      'spep': ['serum protein electrophoresis', 'serum protein electrophoresis (red top)'],
      'upep': ['urine protein electrophoresis'],
      'serum total protein': ['total protein', 'tp'],
      'total urine protein': ['urine total protein', 'urine tp'],
      'serum flc': ['serum free light chain', 'free light chain'],
      'hgb electrophoresis': ['hemoglobin electrophoresis', 'hemoglobin electrophoresis (purple top)'],
      'antithrombin iii': ['anti-thrombin iii'],
      '24h urine': ['24 hour urine', '24-hour urine'],
      'tissue biopsy': ['biopsy', 'histopathology', 'surgical pathology'],
      'cytology (bf)': ['fluid cytology', 'cytology'],
      'csf quali': ['csf qualitative', 'csf quali', 'csf qual'],
      'quali (cell cnt, diff)': ['qualitative', 'quali', 'qual', 'ph', 'quali/ph'],
      'quantitative': ['quantitative', 'quant', 'quanti', 'tp gluc', 'tp/gluc'],
      'csf tb pcr': ['tb pcr', 'mtb pcr', 'tb pcr (csf)'],
      'csf tb genexpert': ['tb genexpert', 'genexpert', 'tb genexpert (csf)'],
      'mtb/rif (csf)': ['mtb-rif', 'mtbrif', 'rif'],
      'tb cs (csf)': ['tbcs', 'tb culture', 'afb cs', 'tb cs'],
      'csf calas': ['calas bf', 'cryptococcal antigen', 'calas'],
      'factor ix': ['bethesda assay', 'bethesda'],
    };

    // Helper for matching a string against lookup/aliases
    const tryMatch = (input: string, specimenHint?: string): LookupEntry | null => {
      const norm = input.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!norm) return null;

      const normalizeBase = (s: string) => 
        s.replace(/quantitative|quanti|quant/g, 'quant')
         .replace(/qualitative|quali|qual/g, 'qual');

      const normBase = normalizeBase(norm);

      const getPriority = (entry: LookupEntry) => {
        if (!specimenHint) return 0;
        const eSpec = entry.specimen.toLowerCase();
        const hint = (specimenHint === 'PF' ? 'Pleural Fluid' : 
                     specimenHint === 'AF' ? 'Ascitic Fluid' : 
                     specimenHint === 'PCF' ? 'Pericardial Fluid' : 
                     specimenHint).toLowerCase();
        if (eSpec === hint) return 2;
        if (eSpec === 'body fluid' || eSpec === 'blood') return 1;
        return 0;
      };

      // Helper to find with priority
      const findBest = (predicate: (entry: LookupEntry) => boolean) => {
        const matches = lookup.filter(predicate);
        if (matches.length === 0) return null;
        return matches.sort((a, b) => getPriority(b) - getPriority(a))[0];
      };

      // Try exact/normalized match
      let m = findBest(entry => {
        const entryNorm = entry.testName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const entryBase = normalizeBase(entryNorm);
        return entryBase === normBase ||
          (entry.testName.toLowerCase() === 'urinalysis' && (norm === 'ua' || norm === 'urinalysis')) ||
          (entry.testName.toLowerCase() === 'fecalysis' && (norm === 'fecalysis' || norm === 'stool' || norm === 'fecal'));
      });

      // Try aliases
      if (!m) {
        const matchAlias = Object.entries(aliases).find(([key, vals]) => {
          return vals.some(v => norm === v.replace(/[^a-z0-9]/g, ''));
        });
        if (matchAlias) {
          const aliasKeyNorm = matchAlias[0].replace(/[^a-z0-9]/g, '');
          m = findBest(entry => entry.testName.toLowerCase().replace(/[^a-z0-9]/g, '') === aliasKeyNorm);
        }
      }
      
      // Try partial prefix match (longer words ONLY)
      if (!m && norm.length >= 4) {
        const prioritySpec = specimenHint?.toLowerCase();
        m = findBest(entry => entry.testName.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(norm));
      }

      return m || null;
    };

    rawLines.forEach(line => {
      const lower = line.toLowerCase();
      
      // Check if the whole line matches a known test or alias
      const isWholeMatch = tryMatch(lower);

      if (isWholeMatch) {
        lines.push(line);
      } else if (lower.includes('full hepatitis profile')) {
        lines.push('Full Hepatitis Profile');
      } else if (lower.includes('hepatitis b profile')) {
        lines.push('Hepatitis B Profile');
      } else if (lower.includes('lipid panel') || lower.includes('lipid profile')) {
        lines.push('Lipid profile');
      } else if (lower.includes('hepatitis panel')) {
        lines.push('HBsAg', 'Anti-HBs', 'Anti-HBc Total', 'Anti-HCV');
      } else if (lower === 'spep') {
        lines.push('SPEP', 'Serum Total Protein');
      } else if (lower === 'upep') {
        lines.push('UPEP', 'Total Urine Protein');
      } else if (line.includes(' ')) {
        // распределение префиксов (distribute prefixes)
        const prefixes = [...CUP_SPECIMENS, 'blood', 'body fluid', 'fluid', 'fecal', 'csf', 'pf', 'af', 'pcf', 'cerebrospinal fluid'];
        // Sort prefixes by length descending to match longest first
        const sortedPrefixes = prefixes.map(p => p.toLowerCase()).sort((a, b) => b.length - a.length);
        const specPrefix = sortedPrefixes.find(s => lower.startsWith(s + ' '));

        if (specPrefix && lower.length > specPrefix.length) {
          const afterPrefix = lower.substring(specPrefix.length).trim();
          
          // Check if it matches a test as a whole first before splitting
          if (tryMatch(afterPrefix, specPrefix.toUpperCase())) {
            lines.push(`${specPrefix} ${afterPrefix}`);
          } else {
            const parts = afterPrefix.split(/\s+/).filter(p => p.trim() !== '');
            if (parts.length > 0) {
              parts.forEach(p => lines.push(`${specPrefix} ${p}`));
            }
          }
        } else {
          // If it contains spaces and didn't match as a whole or as a prefix case
          const parts = line.split(/\s+/).filter(p => p.trim() !== '');
          const forbidden = ['urine', 'stool', 'sputum', 'eta', 'fecal', 'blood', 'fluid', 'aspirate', 'swab', 'csf', 'pf', 'af', 'pcf'];
          const filteredParts = parts.filter(p => !forbidden.includes(p.toLowerCase()));
          lines.push(...filteredParts);
        }
      } else {
        const forbidden = ['urine', 'stool', 'sputum', 'eta', 'fecal', 'blood', 'fluid', 'aspirate', 'swab', 'csf'];
        if (!forbidden.includes(lower)) {
          lines.push(line);
        }
      }
    });
    
    if (lines.length === 0 && !manualName && !manualLocation && !manualAge && !manualSex && !manualCN) {
      if (forms.length > 0) {
        setForms([]);
        setMaterials({});
        setReminders([]);
      }
      return;
    }

    const matchedTests: (LookupEntry & { originalInput: string })[] = lines.map(line => {
      const lowerLine = line.toLowerCase().trim();
      const normalizedInput = lowerLine.replace(/[^a-z0-9]/g, '');
      
      // Strictness: Ignore very short inputs that aren't known aliases
      const isKnownShortAlias = ['na', 'k', 'cl', 'ca', 'mg', 'c3', 'bt', 'ua', 'pt', 'tb', 'db', 'ib', 'rf'].includes(normalizedInput);
      if (normalizedInput.length < 3 && !isKnownShortAlias) {
        return null;
      }

      // Initial attempt at matching the whole line
      let match = tryMatch(lowerLine);

      // 3. Prefix detection / Specimen overriding
      const prefixes = [...CUP_SPECIMENS, 'blood', 'body fluid', 'fluid', 'fecal', 'csf', 'pf', 'af', 'pcf', 'cerebrospinal fluid'];
      const sortedPrefixes = prefixes.map(p => p.toLowerCase()).sort((a, b) => b.length - a.length);
      const specPrefix = sortedPrefixes.find(s => lowerLine.startsWith(s + ' '));

      if (!match && specPrefix) {
        const testPart = lowerLine.substring(specPrefix.length).trim();
        const subMatch = tryMatch(testPart, specPrefix.toUpperCase());
        if (subMatch) {
          // Found the test part! Use its details but override the specimen from our prefix
          let spec = specPrefix.charAt(0).toUpperCase() + specPrefix.slice(1);
          if (spec.toLowerCase() === 'fecal') spec = 'Stool';
          if (spec.toLowerCase() === 'csf') spec = 'CSF';
          if (spec.toLowerCase() === 'pf') spec = 'Pleural Fluid';
          if (spec.toLowerCase() === 'af') spec = 'Ascitic Fluid';
          if (spec.toLowerCase() === 'pcf') spec = 'Pericardial Fluid';
          
          match = { ...subMatch, specimen: spec };

          // Clean up testName if it contains a different specimen name (e.g. "CSF CALAS" -> "CALAS")
          const otherSpecimens = ['CSF', 'Pleural Fluid', 'Ascitic Fluid', 'Pericardial Fluid', 'Body Fluid', 'Blood', 'Urine', 'Stool', 'Sputum', 'ETA', 'BF'];
          otherSpecimens.forEach(os => {
            if (os.toLowerCase() !== spec.toLowerCase() || (os === 'BF' && spec !== 'Body Fluid')) {
              const escaped = os.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // Matches specimen at start, end, or in parentheses
              const regex = new RegExp(`(^${escaped}\\s+)|(\\s*\\(${escaped}\\))|(\\s+${escaped}$)`, 'gi');
              match!.testName = match!.testName.replace(regex, '').trim();
            }
          });
        }
      }

      if (match) {
        // If it's a cup specimen, the top should be N/A
        if (CUP_SPECIMENS.includes(match.specimen.toLowerCase()) || 
            match.specimen.toLowerCase().includes('fluid') || 
            match.specimen.toLowerCase() === 'csf') {
          match.top = 'N/A';
        }
        return { ...match, originalInput: line };
      }

      // 4. Keyword based matching (Strict fallbacks for very common items)
      if (lowerLine.includes('stool exam') || lowerLine === 'stool cs') {
        return { testName: line, specimen: 'Stool', top: 'N/A', formType: 'Clinical Microscopy', originalInput: line };
      } else if (lowerLine === 'urine cs' || lowerLine === 'urine culture') {
        return { testName: line, specimen: 'Urine', top: 'N/A', formType: 'Microbiology', originalInput: line };
      } else if (lowerLine === 'sputum cs' || lowerLine === 'sputum afb') {
        return { testName: line, specimen: 'Sputum', top: 'N/A', formType: 'Microbiology', originalInput: line };
      } else if (lowerLine.includes('body fluid') || lowerLine.includes('pleural fluid') || lowerLine.includes('ascitic fluid')) {
        let spec = 'Body Fluid';
        if (lowerLine.includes('pleural')) spec = 'Pleural Fluid';
        if (lowerLine.includes('ascitic')) spec = 'Ascitic Fluid';
        return { testName: line, specimen: spec, top: 'N/A', formType: 'Clinical Microscopy', originalInput: line };
      }

      return null;
    }).filter((t): t is (LookupEntry & { originalInput: string }) => t !== null);

    // Grouping Logic
    const groupedRequests: LabRequest[] = [];
    const bloodGroups: Record<string, LookupEntry[]> = {};
    const urineChemGroup: LookupEntry[] = [];
    const genericCultureGroups: Record<string, LookupEntry[]> = {}; // Grouped by specimen (Sputum, ETA)
    
    // Body Fluid Grouping Buckets: SpecimenName -> GroupKey -> Tests[]
    // Groups: 'QUAL', 'QUANT', 'MICRO', 'CALAS', 'MRL_PCR', 'MRL_GENEXPERT'
    const fluidGroups: Record<string, Record<string, LookupEntry[]>> = {};
    
    const specialTests: LookupEntry[] = []; // Biofire, GeneXpert (General)

    matchedTests.forEach(test => {
      const nameUpper = test.testName.toUpperCase();
      const isSpecial = nameUpper.includes('BIOFIRE') || nameUpper.includes('GENEXPERT') || 
                        nameUpper.includes('MTB/RIF') || nameUpper.includes('MTB-RIF') || 
                        nameUpper.includes('4PLEX');
      const isApas = nameUpper.includes('APAS PANEL');
      
      if (nameUpper.includes('FACTOR IX') || nameUpper.includes('BETHESDA')) {
        test.formType = 'MRL';
      }

      const isFluid = ['Pleural Fluid', 'Ascitic Fluid', 'Pericardial Fluid', 'Body Fluid', 'CSF'].includes(test.specimen) || 
                      test.specimen.toLowerCase().includes('fluid') || 
                      test.specimen.toLowerCase() === 'csf';
      
      if (isSpecial) {
        specialTests.push(test);
      } else if (isApas) {
        groupedRequests.push(createFormFromTests([test]));
      } else if (test.specimen === 'Urine' && test.formType === 'Chemistry') {
        urineChemGroup.push(test);
      } else if (isFluid) {
        if (!fluidGroups[test.specimen]) fluidGroups[test.specimen] = {};
        
        let groupKey = 'OTHER';
        const nameU = test.testName.toUpperCase();
        if (nameU.includes('QUALI') || nameU.includes(' PH') || nameU === 'PH' || nameU.includes('CELL COUNT') || nameU.includes('DIFF') || nameU.includes('CELL CNT')) {
          groupKey = 'QUAL';
        } else if (nameU.includes('QUANT') || nameU.includes('TP') || nameU.includes('GLUC') || nameU.includes('SUGAR') || nameU.includes('LDH') || nameU.includes('ALBUMIN') || nameU.includes('PROTEIN') || nameU.includes('AMYLASE')) {
          groupKey = 'QUANT';
        } else if (nameU.includes('GS/CS') || nameU.includes('AFB') || nameU.includes('C/S') || nameU.includes('GSCS') || nameU.includes('INDIA INK') || nameU.includes('FUNGAL') || nameU.includes('KOH') || nameU.includes('GRAM') || nameU.includes('TB CS') || nameU.includes('TBCS') || nameU.includes('CULTURE')) {
          groupKey = 'MICRO';
        } else if (nameU.includes('CALAS')) {
          groupKey = 'CALAS';
        } else if (nameU.includes('TB PCR') || nameU.includes('PCR')) {
          groupKey = 'MRL_PCR';
        } else if (nameU.includes('GENEXPERT') || nameU.includes('MTB/RIF')) {
          groupKey = 'MRL_GENEXPERT';
        }
        
        // TB PCR and GeneXpert should always be separate forms even for same group
        if (groupKey === 'MRL_PCR' || groupKey === 'MRL_GENEXPERT') {
          groupedRequests.push(createFormFromTests([test], 'MRL'));
        } else {
          if (!fluidGroups[test.specimen][groupKey]) fluidGroups[test.specimen][groupKey] = [];
          fluidGroups[test.specimen][groupKey].push(test);
        }
      } else if (['Sputum', 'ETA'].includes(test.specimen) && 
                 (nameUpper.includes('GS/CS') || nameUpper.includes('AFB') || nameUpper.includes('C/S'))) {
        if (!genericCultureGroups[test.specimen]) genericCultureGroups[test.specimen] = [];
        genericCultureGroups[test.specimen].push(test);
      } else if (test.specimen === 'Blood') {
        const key = `${test.formType}|${test.top}`;
        if (!bloodGroups[key]) bloodGroups[key] = [];
        bloodGroups[key].push(test);
      } else {
        // Default: separate form
        groupedRequests.push(createFormFromTests([test]));
      }
    });

    // Process Groups
    Object.values(bloodGroups).forEach(group => groupedRequests.push(createFormFromTests(group)));
    if (urineChemGroup.length > 0) groupedRequests.push(createFormFromTests(urineChemGroup));
    Object.values(genericCultureGroups).forEach(group => groupedRequests.push(createFormFromTests(group)));
    
    // Process Fluid Groups
    Object.entries(fluidGroups).forEach(([specimen, groups]) => {
      Object.entries(groups).forEach(([groupKey, tests]) => {
        let formType = tests[0].formType;
        if (groupKey === 'MICRO') formType = 'Microbiology';
        if (groupKey === 'CALAS') formType = 'MRL';
        groupedRequests.push(createFormFromTests(tests, formType));
      });
    });

    specialTests.forEach(test => groupedRequests.push(createFormFromTests([test], 'Special')));

    function createFormFromTests(tests: LookupEntry[], overrideFormType?: string): LabRequest {
      const first = tests[0];
      const ageSex = `${manualAge}${manualSex}`;
      
      // Handle naming for non-blood
      const requestsList = tests.map(t => {
        const lower = t.testName.toLowerCase();
        if (lower === 'full hepatitis profile') {
          return 'Full Hepatitis Profile (HBsAg, Anti-HBs, Anti-HBc Total, HBeAg, Anti-HBe, Anti-HAV IgM, Anti-HCV, Anti-HBc IgM)';
        }
        if (lower === 'hepatitis b profile') {
          return 'Hepatitis B Profile (HBsAg, Anti-HBs, Anti-HBc Total, HBeAg, Anti-HBe, Anti-HBc IgM)';
        }
        if (lower === 'lipid profile') {
          return 'Lipid profile (Triglycerides, Total cholesterol, LDL, HDL)';
        }

        if (t.specimen !== 'Blood' && !t.testName.toLowerCase().includes(t.specimen.toLowerCase())) {
          if (t.testName.toUpperCase() === 'UA') return 'Urinalysis';
          if (t.testName.toUpperCase() === 'FECALYSIS') return 'Fecalysis';
          if (t.specimen === 'Urine' && t.testName.toLowerCase() === 'urinalysis') return 'Urinalysis';
          if (t.specimen === 'Urine') return `Urine ${t.testName}`;
          return `${t.specimen} ${t.testName}`;
        }
        if (t.specimen === 'Urine' && t.testName.toLowerCase() !== 'urinalysis' && !t.testName.toLowerCase().startsWith('urine')) {
          return `Urine ${t.testName}`;
        }
        return t.testName;
      }).join(', ');

      const form: LabRequest = {
        name: manualName.toUpperCase(),
        ward_location: isEr ? "ER" : manualLocation.toUpperCase(),
        age_sex: ageSex,
        birthday: manualBirthday,
        case_number: manualCN,
        diagnosis: '', 
        requested_by: '',
        date_collected: getCurrentDateMMDD(),
        time_collected: timeCollected,
        collected_by: collector.toUpperCase(),
        specimen_type: first.specimen,
        site_of_collection: '',
        form_type: overrideFormType || first.formType,
        tube_top: first.top,
        requests_list: requestsList
      };
      return form;
    }

    setForms(groupedRequests);
    calculateMaterialsAndReminders(groupedRequests);
  }, [manualName, manualBirthday, manualAge, manualSex, manualCN, manualLocation, manualLabs, isEr, timeCollected, collector]);

  const calculateMaterialsAndReminders = (formList: LabRequest[]) => {
    const matDetails: Record<string, MaterialDetail> = {};
    const rems = new Set<string>();
    const criticalRems: Reminder[] = [];
    let bcsCount = 0;
    const iceTests = new Set<string>();
    let isLactate = false;

    formList.filter(f => f.name || f.requests_list).forEach(form => {
      const tube = form.tube_top.toUpperCase();
      const requests = form.requests_list.toUpperCase();
      const specimen = form.specimen_type.toLowerCase();

      if (requests.includes('APAS PANEL')) {
        if (!matDetails['RED']) matDetails['RED'] = { count: 0, tests: [] };
        matDetails['RED'].count += 2;
        matDetails['RED'].tests.push('APAS Panel (2 Red)');

        if (!matDetails['BLUE (WHITE)']) matDetails['BLUE (WHITE)'] = { count: 0, tests: [] };
        matDetails['BLUE (WHITE)'].count += 5;
        matDetails['BLUE (WHITE)'].tests.push('APAS Panel (5 Blue White)');
      } else if (tube !== 'N/A' && tube) {
        if (!matDetails[tube]) matDetails[tube] = { count: 0, tests: [] };
        matDetails[tube].count++;
        matDetails[tube].tests.push(form.requests_list);
      }

      if (CUP_SPECIMENS.includes(specimen)) {
        if (!matDetails['SPECIMEN CUP']) matDetails['SPECIMEN CUP'] = { count: 0, tests: [] };
        matDetails['SPECIMEN CUP'].count++;
        matDetails['SPECIMEN CUP'].tests.push(form.requests_list);
      }

      if (requests.includes('BLOOD CS') || requests.includes('BCS') || requests.includes('BLOOD CULTURE')) {
        bcsCount += (requests.includes('X2') || requests.includes('X 2')) ? 2 : 1;
      }

      if (requests.includes('ANAEROBIC CULTURE')) {
        if (!matDetails['ANAEROBIC CULTURE BOTTLE']) matDetails['ANAEROBIC CULTURE BOTTLE'] = { count: 0, tests: [] };
        matDetails['ANAEROBIC CULTURE BOTTLE'].count++;
        matDetails['ANAEROBIC CULTURE BOTTLE'].tests.push('Anaerobic Culture');
      }

      if (tube === 'BLUE') rems.add("BLUE TOP: Fill to the indicator line.");
      if (tube === 'GREEN') rems.add("GREEN TOP: Fill to the line (4mL).");
      if (requests.includes('VANCO TROUGH')) rems.add("For Vanco Trough, Cover red top with carbon paper prior to extraction. Fill at least 3mL.");
      
      if (requests.includes('ICA') || (requests.includes('CALCIUM') && tube === 'GREEN')) {
        iceTests.add('iCa');
      }
      if (requests.includes('LACTATE')) {
        iceTests.add('Lactate');
      }
      if (requests.includes('NH3') || requests.includes('AMMONIA')) {
        iceTests.add('Ammonia');
      }
      if (requests.includes('PLASMA K')) {
        rems.add("PLASMA K: No tourniquet. No ice needed.");
      }

      if (requests.includes('FACTOR IX') || requests.includes('BETHESDA ASSAY')) {
        rems.add("Factor IX/Bethesda Assay: Patient and reference person MUST NOT be related. Both must fast for 8 hours. Available Tuesday & Wednesday only. Requires prior scheduling with MRL (Submitted to MRL).");
      }

      if (requests.includes('HBA1C')) rems.add("For HbA1c, fill to at least 2mL. Do not use a microtainer tube.");
      if (requests.includes('HEMOGLOBIN ELECTROPHORESIS') || requests.includes('HGB ELECTROPHORESIS')) {
        rems.add("Hgb Electrophoresis: Tue & Thu 8-9AM. At least 2mL. Needs CBC (<3d), Ferritin, Iron, dTIBC. No transfusion last 3 mos.");
      }
      if (requests.includes('SERUM PROTEIN ELECTROPHORESIS') || requests.includes('SPEP')) {
        rems.add("SPEP (Serum): Tue & Thu 8-9AM. Fast 6h. Inform ClinChem (3212) day before. Needs Serum TP. No BetaLactams/Contrast (3d) or Anticoagulant (24h).");
      }
      if (requests.includes('URINE PROTEIN ELECTROPHORESIS') || requests.includes('UPEP')) {
        rems.add("UPEP (Urine): Mon, Wed, Fri. 60ml morning urine. Ask cup from Central Labs. Needs simultaneous Urine TP (Total 2 cups).");
      }
      if (requests.includes('SERUM FLC') || requests.includes('FREE LIGHT CHAIN')) {
        rems.add("Serum FLC: 4-6 hours fasting required.");
      }
      if (requests.includes('ANA') && form.form_type.toUpperCase() === 'MRL') {
        rems.add("ANA (MRL): 6 hours fasting. Needs resident's signature.");
      }
      if (requests.includes('ANTITHROMBIN III') || requests.includes('FACTOR VIII INHIBITOR') || requests.includes('FACTOR XI INHIBITOR')) {
        rems.add("MRL Hematology (AT-III/F8/F11 Inhibitor): 4-6 hours fasting. Blue-top, fill 4-5 mL.");
      }
      if (requests.includes('FBS') || requests.includes('LIPID PROFILE')) {
        rems.add("FBS/Lipid Profile: Fast for 10-12 hours.");
      }
      if (requests.includes('CBC')) rems.add("For CBC, do not submit <1mL on a 4mL tube.");
      if (requests.includes('ESR')) rems.add("ESR: Needs to be at least 2 mL.");
      if (requests.includes('URINALYSIS') || requests.includes('UA')) rems.add("Urinalysis: At least 3mL of urine is required.");
      
      if (requests.includes('TB QUANTIFERON')) {
        const isPedia = parseInt(manualAge) < 18 || manualAge.toLowerCase().includes('mo') || manualAge.toLowerCase().includes('day');
        if (!isPedia) {
          if (!matDetails['GREEN']) matDetails['GREEN'] = { count: 0, tests: [] };
          matDetails['GREEN'].count++; // Add second tube for adult
          matDetails['GREEN'].tests.push('TB Quantiferon (2nd tube)');
        }
        rems.add("TB Quantiferon: 2 Green tops for adults, 1-2 for pedia. Mon-Thu only. Cut-off: 3:00 PM.");
      }
      if (form.form_type.toUpperCase() === 'MRL' && !requests.includes('STOOL AFB') && !requests.includes('TB QUANTIFERON') && !requests.includes('GENEXPERT')) {
        rems.add("MRL: 8:00 AM - 3:00 PM, Monday to Friday.");
      }
      if (requests.includes('STOOL AFB')) {
        rems.add("Stool AFB: Monday-Thursday only. Cut-off: 3:00 PM.");
      }
      if (requests.includes('GENEXPERT')) {
        rems.add("GeneXpert: Monday and Friday only (8 AM - 3 PM) in MRL and TB-DOTS.");
      }
      if (requests.includes('4PLEX')) {
        rems.add("4PLEX: Swab nares (longer) and throat (other). Retrieve VTM from Molecular Lab (2nd flr). Printed labels preferred.");
      }
      if (requests.includes('SPEP')) {
        rems.add("SPEP: MWF 8-9AM. Needs simultaneous Serum Total Protein. Reader's fee P200.");
      }
      if (requests.includes('UPEP')) {
        rems.add("UPEP: MWF 8-9AM. Full cup first void morning urine. Needs simultaneous Total Urine Protein. Reader's fee P200.");
      }
      if (requests.includes('24H URINE')) {
        rems.add("24H URINE: Icebox during collection. Cut-off 10 AM M-F.");
      }
      if (requests.includes('CYTOLOGY')) {
        rems.add("Fluid Cytology: Fix 1:1 with 95% ethanol.");
      }
      if (specimen === 'tissue' || specimen === 'organ') {
        rems.add("Tissue/Organ: Submerge in Formalin.");
      }
      if (requests.includes('PRBC')) {
        rems.add("PRBC: Needs Cross-matching (XM) sample (Purple EDTA).");
      }
      if (requests.includes('PLATELET') || requests.includes('FFP')) {
        rems.add("Platelet/FFP: Only if never transfused.");
      }
      if (requests.includes('CRYOPRECIPITATE')) {
        rems.add("Cryoprecipitate: Needs waiver.");
      }
      if (['pleural fluid', 'ascitic fluid', 'pericardial fluid', 'body fluid'].includes(specimen)) {
        rems.add("Body Fluids: Qualitative/pH, Quantitative, Microbiology (GSCS/AFB/etc), and CALAS can be submitted to Central Labs.");
      }

      if (requests.includes('SPEP') || requests.includes('UPEP') || requests.includes('ELECTROPHORESIS')) {
        rems.add("Reader's fee of P200 for elective electrophoresis for service patients.");
        rems.add("(For Electrophoresis) Relative must be the one to pay and bring samples to Clinical Chemistry Office.");
      }
    });

    if (bcsCount > 0) {
      if (!matDetails['SPECIAL BOTTLE']) matDetails['SPECIAL BOTTLE'] = { count: 0, tests: [] };
      matDetails['SPECIAL BOTTLE'].count = bcsCount * 2;
      matDetails['SPECIAL BOTTLE'].tests = [`Blood CS (Total Forms: ${bcsCount})`];
    }

    if (iceTests.size > 0) {
      const testsStr = Array.from(iceTests).join(', ');
      let iceMsg = `ICE TRANSPORT: For ${testsStr}, use solid crushed ice. SEND IMMEDIATELY!`;
      
      const noTourniquet = [];
      if (iceTests.has('Lactate')) noTourniquet.push('Lactate');
      if (iceTests.has('Ammonia')) noTourniquet.push('Ammonia');
      
      if (noTourniquet.length > 0) {
        iceMsg += ` (No tourniquet for ${noTourniquet.join(' and ')}).`;
      }
      
      iceMsg += " Send directly to ClinChem after tagging in central labs.";
      
      criticalRems.push({ text: iceMsg, critical: true, type: 'ICE' });
    }

    if (unstructured.toUpperCase().includes('ABG') || unstructured.toUpperCase().includes('VBG')) {
      criticalRems.push({ text: "For ABG/VBG: Use 1cc tuberculin needle with 0.1 mL heparin, ice. Label with Ward, Bed, Name, Case #, Temp, FiO2, Time, Name. Bring to ABG 2nd floor near Ward 4.", critical: true, type: 'ABG' });
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (formList.some(f => f.form_type.toUpperCase() === 'NUCLEAR MEDICINE')) {
      const status = (hour >= 7 && hour < 9) ? "OPEN (7-9 AM)" : "CLOSED (7-9 AM)";
      criticalRems.push({ text: `NUCMED REQUESTED: ${status}`, critical: true, type: 'NUCMED' });

      const nucmedRequests = formList.filter(f => f.form_type.toUpperCase() === 'NUCLEAR MEDICINE').map(f => f.requests_list.toUpperCase()).join(', ');

      // Fasting reminders
      if (nucmedRequests.includes('CORTISOL') || nucmedRequests.includes('HGH') || nucmedRequests.includes('GROWTH HORMONE') || nucmedRequests.includes('INSULIN') || nucmedRequests.includes('C-PEPTIDE') || nucmedRequests.includes('RENIN') || nucmedRequests.includes('ACTH')) {
        rems.add("NUCMED FASTING: Cortisol, hGH, Insulin, C-Peptide, Renin, and ACTH require 8-12 hours fasting.");
      }

      // Day reminders
      if (nucmedRequests.includes('FT3') || nucmedRequests.includes('FREE TRIIODOTHYRONINE') || nucmedRequests.includes('CORTISOL') || nucmedRequests.includes('PROLACTIN')) {
        if (day !== 1 && day !== 3 && day !== 5) rems.add("FT3/Cortisol/Prolactin: Available M, W, F only.");
      }
      if (nucmedRequests.includes('25-HYDROXY VIT D') || nucmedRequests.includes('PTH') || nucmedRequests.includes('PARATHYROID HORMONE')) {
        if (day !== 1 && day !== 2 && day !== 3 && day !== 4) rems.add("Vit D/PTH: Available Mon-Thu only.");
      }
      if (nucmedRequests.includes('HCG') || nucmedRequests.includes('HUMAN CHORIONIC GONADOTROPIN') || nucmedRequests.includes('17-OHP') || nucmedRequests.includes('17A-HYDROXYPROGESTERONE')) {
        if (day !== 1 && day !== 4) rems.add("HCG/17-OHP: Available M, Th only.");
      }
      if (nucmedRequests.includes('ANTITHYROGLOBULIN') || nucmedRequests.includes('TPO') || nucmedRequests.includes('TESTOSTERONE') || nucmedRequests.includes('THYROGLOBULIN')) {
        if (day !== 2 && day !== 4) rems.add("TPO/Testosterone/Thyroglobulin: Available T, Th only.");
      }
      if (nucmedRequests.includes('DHEAS') || nucmedRequests.includes('DEHYDROEPIANDROSTERONE')) {
        if (day !== 1) rems.add("DHEAS: Available Mondays only.");
      }
      if (nucmedRequests.includes('TRAB') || nucmedRequests.includes('TSH RECEPTOR ANTIBODY')) {
        const isLastMonday = () => {
          if (day !== 1) return false;
          const nextWeek = new Date(now);
          nextWeek.setDate(now.getDate() + 7);
          return nextWeek.getMonth() !== now.getMonth();
        };
        if (!isLastMonday()) rems.add("TRAB: Available Last Monday of the Month only.");
      }
      if (nucmedRequests.includes('HGH') || nucmedRequests.includes('GROWTH HORMONE') || nucmedRequests.includes('IGF-1') || nucmedRequests.includes('INSULIN-LIKE GROWTH FACTOR 1')) {
        if (day !== 2) rems.add("hGH/IGF-1: Available Tuesdays only.");
      }
      if (nucmedRequests.includes('INSULIN') || nucmedRequests.includes('C-PEPTIDE') || nucmedRequests.includes('FSH') || nucmedRequests.includes('FOLLICLE-STIMULATING HORMONE') || nucmedRequests.includes('LH') || nucmedRequests.includes('LUTEINIZING HORMONE')) {
        if (day !== 3) rems.add("Insulin/C-Peptide/FSH/LH: Available Wednesdays only.");
      }
      if (nucmedRequests.includes('ALDOSTERONE') || nucmedRequests.includes('RENIN') || nucmedRequests.includes('ESTRADIOL') || nucmedRequests.includes('ACTH') || nucmedRequests.includes('ADRENOCORTICOTROPIC HORMONE')) {
        if (day !== 5) rems.add("Aldo/Renin/Estradiol/ACTH: Available Fridays only.");
      }
    }

    if (formList.some(f => f.form_type.toUpperCase() === 'MRL' || f.requests_list.toUpperCase().includes('STOOL AFB') || f.requests_list.toUpperCase().includes('TB QUANTIFERON') || f.requests_list.toUpperCase().includes('GENEXPERT'))) {
      const isStoolAfbOrQuant = formList.some(f => f.requests_list.toUpperCase().includes('STOOL AFB') || f.requests_list.toUpperCase().includes('TB QUANTIFERON'));
      const isGeneXpert = formList.some(f => f.requests_list.toUpperCase().includes('GENEXPERT'));
      
      let weekday = day >= 1 && day <= 5;
      let cutoffHour = 15;
      let scheduleMsg = "MRL REQUESTED";

      if (isStoolAfbOrQuant) {
        weekday = day >= 1 && day <= 4; // Mon-Thu only
        scheduleMsg = "MRL/CENTRAL LAB (STOOL AFB/QUANTIFERON)";
      } else if (isGeneXpert) {
        weekday = day === 1 || day === 5; // Mon and Fri only
        scheduleMsg = "GENEXPERT (MRL/TB-DOTS)";
      }

      const open = weekday && hour >= 8 && hour < 15;
      const cutoff = weekday && hour >= cutoffHour;
      
      let status = "CLOSED";
      if (!weekday) {
        if (isStoolAfbOrQuant) status = "CLOSED (Mon-Thu only)";
        else if (isGeneXpert) status = "CLOSED (Mon & Fri only)";
        else status = "CLOSED (Weekend)";
      }
      else if (cutoff) status = "CLOSED (Cut-off: 3 PM)";
      else if (open) status = "OPEN (8 AM - 3 PM)";
      
      criticalRems.push({ text: `${scheduleMsg}: ${status}`, critical: true, type: 'MRL' });
    }

    setMaterials(matDetails);
    setReminders([...criticalRems, ...Array.from(rems).map(r => ({ text: r, critical: false }))]);
  };

  const updateForm = (index: number, updatedForm: LabRequest) => {
    const newForms = [...forms];
    newForms[index] = updatedForm;
    setForms(newForms);
    calculateMaterialsAndReminders(newForms);
  };

  const [mode, setMode] = useState<'needs' | 'generator'>('needs');

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      alert("Print failed. If you are using Google AI Studio, try opening the app in a new tab using the button at the top right of the preview.");
    }
  };

  return (
    <div id="form-tool-content" className="w-full">
      <div className="input-section">
        <div id="title-logo-wrapper">
          <AnimatedTabIcon id="form-tool-content" isActive={true} size={30} />
          <h2 className="text-xl md:text-2xl">Labs Assistant</h2>
        </div>

        {/* Giant Mode Switch */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-1 rounded-full flex w-full max-w-[400px] shadow-md relative overflow-hidden border border-slate-200">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#334155] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-lg ${mode === 'generator' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
            />
            <button 
              onClick={() => setMode('needs')}
              className={`mode-switch-btn flex-1 py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold z-10 transition-colors duration-500 border-none cursor-pointer bg-transparent !shadow-none !translate-y-0 leading-none ${mode === 'needs' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              LAB NEEDS MODE
            </button>
            <button 
              onClick={() => setMode('generator')}
              className={`mode-switch-btn flex-1 py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold z-10 transition-colors duration-500 border-none cursor-pointer bg-transparent !shadow-none !translate-y-0 leading-none ${mode === 'generator' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              LAB GENERATOR MODE
            </button>
          </div>
        </div>

        {mode === 'needs' ? (
          /* Lab Needs Mode */
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 mb-6 w-full items-stretch">
              {/* Column 1: Input (1/3) */}
              <div className="w-full md:w-1/3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <label className="text-sm md:text-base font-bold text-[#334155]">Labs Request List</label>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1">Separate tests with linebreaks, commas, or spaces.</p>
                  </div>
                  <button 
                    onClick={() => setShowLookup(true)}
                    className="text-[10px] md:text-xs bg-[#334155] text-white px-3 py-1 rounded-full hover:bg-opacity-90 transition-all"
                  >
                    Lookup Table
                  </button>
                </div>
                <textarea 
                  className="flex-grow !h-full text-base md:text-lg p-3 min-h-[125px] md:min-h-[250px]"
                  placeholder={"CBC\nUrinalysis"}
                  value={manualLabs}
                  onChange={(e) => setManualLabs(e.target.value)}
                />
              </div>

              {/* Column 2: Materials (1/3) */}
              <div className="w-full md:w-1/3">
                <div className="materials-estimation-box h-full">
                  <div id="materials-estimation">
                    <div className="flex items-center gap-2 border-b border-dotted border-[#ced4da] pb-2 mb-3">
                      <h3 className="text-[#334155] m-0 text-base md:text-lg font-bold whitespace-nowrap flex-shrink-0">
                        📦 Estimated Materials
                      </h3>
                      <span className="text-[9px] md:text-[11px] text-red-600 font-extrabold italic uppercase tracking-tight leading-tight">
                        ⚠️ Always double check with the list.
                      </span>
                    </div>
                    <div className="material-column">
                      {Object.keys(materials).length > 0 ? (
                        <ul className="list-none p-0 m-0 space-y-2">
                          {(Object.entries(materials) as [string, MaterialDetail][])
                            .sort(([a], [b]) => {
                              if (a === 'Unidentified request') return 1;
                              if (b === 'Unidentified request') return -1;
                              return a.localeCompare(b);
                            })
                            .map(([key, matDetail]) => {
                              const count = matDetail.count;
                              if (count === 0) return null;
                              
                              let materialName;
                              let colorClass = `tube-color-${key.replace(/\s/g, '-').toUpperCase()}`;
                              
                              if (key.includes('SPECIAL BOTTLE')) {
                                materialName = (count === 1 ? 'BCS BOTTLE' : 'BCS BOTTLES') + ' (or 1 for pedia)';
                                colorClass = 'tube-color-BROWN'; 
                              } else if (key.includes('4 SPECIAL TUBES')) {
                                materialName = (count === 1 ? 'SPECIAL TUBE' : 'SPECIAL TUBES');
                                materialName = `4 ${materialName}`;
                                colorClass = 'tube-color-GREY'; 
                              } else if (key === 'SPECIMEN CUP') {
                                materialName = (count === 1 ? 'SPECIMEN CUP' : 'SPECIMEN CUPS');
                                colorClass = 'tube-color-SPECIMEN-CUP';
                              } else if (key.toUpperCase().includes('SYRINGE')) {
                                materialName = (count === 1 ? 'SYRINGE' : 'SYRINGES');
                                materialName = `${key}`;
                                colorClass = 'tube-color-LIGHT-BLUE';
                              } else if (key === 'Unidentified request') {
                                materialName = 'Unidentified request';
                                colorClass = 'tube-color-BLACK';
                              } else {
                                materialName = (count === 1 ? 'TOP' : 'TOPS'); 
                                materialName = `${key} ${materialName}`;
                              }

                              const hoverTitle = matDetail.tests.map((t, i) => `${i + 1}. ${t}`).join('\n');

                              return (
                                <li key={key} className="flex flex-col py-1 border-b border-gray-100 last:border-0">
                                  <div className="flex items-center gap-2 group">
                                    <span 
                                      className={`${colorClass} flex items-center justify-between w-full font-bold text-base md:text-lg`}
                                      title={hoverTitle}
                                    >
                                      <span>{count} {materialName}</span>
                                    </span>
                                  </div>
                                  <ul className="ml-4 mt-0 list-disc bg-transparent p-0">
                                    {matDetail.tests.map((t, i) => (
                                      <li key={i} className="text-[15px] text-gray-500 mb-0 ml-4 leading-none font-normal">
                                        {t}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <p className="text-[10px] md:text-[11px] text-gray-500">No materials estimated yet. Enter labs above.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Reminders (1/3) */}
              <div className="w-full md:w-1/3">
                <div className="reminders-section-box h-full">
                  <div id="reminders-section">
                    <h3 className="text-[#334155] mt-0 mb-3 text-base md:text-lg border-b border-dotted border-[#ced4da] pb-2 font-bold">
                      ⚠️ Important Reminders
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                      {reminders.length > 0 ? (
                        reminders.map((rem, idx) => (
                          <li key={idx} className={`${rem.critical ? "critical-reminder text-red-600" : "text-gray-700"} leading-tight`}>
                            {rem.text}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 text-[10px] md:text-[11px] list-none">No reminders at this time.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lab Request Generator Mode */
          <div className="animate-in slide-in-from-right-4 duration-500">
            <div id="collector-control" className="flex flex-wrap gap-3 md:gap-5 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center w-full md:w-auto">
                <label className="control-label min-w-[100px] md:min-w-0 text-xs md:text-sm">Collected By:</label>
                <input 
                  type="text" 
                  className="control-input flex-grow md:flex-initial text-base" 
                  placeholder="CLK/INT ____"
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                />
              </div>
              <div className="flex items-center w-full md:w-auto">
                <label className="control-label min-w-[100px] md:min-w-0 text-xs md:text-sm">Time Collected:</label>
                <input 
                  type="text" 
                  className="control-input !w-full md:!w-[120px] flex-grow md:flex-initial text-base" 
                  placeholder="HH:MM am/pm"
                  value={timeCollected}
                  onChange={(e) => setTimeCollected(e.target.value)}
                />
              </div>
              <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
                <span className="control-label mr-2.5 text-xs md:text-sm">ER Override:</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isEr} onChange={(e) => setIsEr(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Raw Data Column */}
              <div className="flex-1">
                <p className="instruction-text2 !mt-0 mb-2 text-sm md:text-base">Raw Data Input</p>
                <textarea 
                  className="!h-[200px] md:!h-[350px] text-sm md:text-base"
                  placeholder='Example: Patient Jane Doe, 45/F, Ward Bed 3, 1979-11-20
CBC
Urinalysis
Na,K,Cl'
                  value={unstructured}
                  onChange={(e) => setUnstructured(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <button onClick={handleAutoFill} disabled={loading} className="bg-[#334155] text-white px-6 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all flex-grow text-sm md:text-base">
                    {loading ? "Processing..." : "Auto-Fill from Raw Data"}
                  </button>
                  {loading && (
                    <div id="api-loading-status" className="flex items-center gap-2 text-[#334155] font-medium text-xs">
                      <div className="loader"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Input Column */}
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <p className="instruction-text3 !mt-0 text-sm md:text-base">Manual Patient Details</p>
                  <button 
                    onClick={() => setShowLookup(true)}
                    className="text-[10px] md:text-xs bg-[#334155] text-white px-2 py-1 rounded hover:bg-opacity-90 transition-all"
                  >
                    Lookup Table
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      className="p-3 md:p-2 border border-[#ced4da] rounded text-base"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Location</label>
                      <input 
                        type="text" 
                        className="p-3 md:p-2 border border-[#ced4da] rounded text-base"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Case Number</label>
                      <input 
                        type="text" 
                        className="p-3 md:p-2 border border-[#ced4da] rounded text-base"
                        value={manualCN}
                        onChange={(e) => setManualCN(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Age</label>
                      <input 
                        type="text" 
                        className="p-3 md:p-2 border border-[#ced4da] rounded text-base"
                        value={manualAge}
                        onChange={(e) => setManualAge(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Sex</label>
                      <div className="flex items-center gap-3 h-[46px] md:h-[38px]">
                        <label className="flex items-center gap-1 cursor-pointer text-xs md:text-sm text-[#334155]">
                          <input type="radio" name="sex" value="M" checked={manualSex === 'M'} onChange={(e) => setManualSex(e.target.value)} className="accent-[#334155]" /> M
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs md:text-sm text-[#334155]">
                          <input type="radio" name="sex" value="F" checked={manualSex === 'F'} onChange={(e) => setManualSex(e.target.value)} className="accent-[#334155]" /> F
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Birthday</label>
                      <input 
                        type="text" 
                        placeholder="MM/DD/YYYY"
                        className="p-3 md:p-2 border border-[#ced4da] rounded text-base"
                        value={manualBirthday}
                        onChange={(e) => setManualBirthday(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] md:text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">Labs (Requests List)</label>
                    <p className="text-[9px] md:text-[10px] text-gray-500 mb-1 leading-tight">Separate tests with linebreaks, commas, or spaces.</p>
                    <textarea 
                      className="p-3 md:p-2 border border-[#ced4da] rounded text-base !h-[100px] md:!h-[150px]"
                      placeholder={"CBC\nUrinalysis"}
                      value={manualLabs}
                      onChange={(e) => setManualLabs(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Materials & Reminders in Generator Mode */}
            <div className="materials-and-reminders-group flex flex-col md:flex-row gap-4 mb-6">
              <div className="materials-estimation-box w-full md:w-1/3">
                <div id="materials-estimation">
                  <div className="flex items-center gap-2 border-b border-dotted border-[#ced4da] pb-2 mb-3">
                    <h3 className="text-[#334155] m-0 text-base md:text-lg font-bold whitespace-nowrap flex-shrink-0">
                      📦 Estimated Materials
                    </h3>
                    <span className="text-[9px] md:text-[11px] text-red-600 font-extrabold italic uppercase tracking-tight leading-tight">
                      ⚠️ Always double check with the list.
                    </span>
                  </div>
                  <div className="material-column">
                    {Object.keys(materials).length > 0 ? (
                      <ul className="list-none p-0 m-0 space-y-2">
                        {(Object.entries(materials) as [string, MaterialDetail][])
                          .sort(([a], [b]) => {
                            if (a === 'Unidentified request') return 1;
                            if (b === 'Unidentified request') return -1;
                            return a.localeCompare(b);
                          })
                          .map(([key, matDetail]) => {
                            const count = matDetail.count;
                            if (count === 0) return null;
                            
                            let materialName;
                            let colorClass = `tube-color-${key.replace(/\s/g, '-').toUpperCase()}`;
                            
                            if (key.includes('SPECIAL BOTTLE')) {
                              materialName = (count === 1 ? 'BCS BOTTLE' : 'BCS BOTTLES');
                              colorClass = 'tube-color-BROWN'; 
                            } else if (key.includes('4 SPECIAL TUBES')) {
                              materialName = (count === 1 ? 'SPECIAL TUBE' : 'SPECIAL TUBES');
                              materialName = `4 ${materialName}`;
                              colorClass = 'tube-color-GREY'; 
                            } else if (key === 'SPECIMEN CUP') {
                              materialName = (count === 1 ? 'SPECIMEN CUP' : 'SPECIMEN CUPS');
                              colorClass = 'tube-color-SPECIMEN-CUP';
                            } else if (key.toUpperCase().includes('SYRINGE')) {
                              materialName = (count === 1 ? 'SYRINGE' : 'SYRINGES');
                              materialName = `${key}`;
                              colorClass = 'tube-color-LIGHT-BLUE';
                            } else if (key === 'Unidentified request') {
                              materialName = 'Unidentified request';
                              colorClass = 'tube-color-BLACK';
                            } else {
                              materialName = (count === 1 ? 'TOP' : 'TOPS'); 
                              materialName = `${key} ${materialName}`;
                            }

                            return (
                              <li key={key} className="flex flex-col py-1 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className={`${colorClass} flex items-center justify-between w-full font-bold text-sm md:text-base`}>
                                    <span>{count} {materialName}</span>
                                  </span>
                                </div>
                                <ul className="ml-4 mt-1 list-disc bg-transparent p-0">
                                  {matDetail.tests.map((t, i) => (
                                    <li key={i} className="text-[11px] text-gray-500 mb-0 ml-4 leading-none font-normal">
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            );
                          })}
                      </ul>
                    ) : (
                      <p className="text-[10px] md:text-[11px] text-gray-500">No materials estimated yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="reminders-section-box w-full md:w-2/3">
                <div id="reminders-section">
                  <h3 className="text-[#334155] mt-0 mb-3 text-base md:text-lg border-b border-dotted border-[#ced4da] pb-2 font-bold">
                    ⚠️ Important Reminders
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs md:text-sm">
                    {reminders.length > 0 ? (
                      reminders.map((rem, idx) => (
                        <li key={idx} className={`${rem.critical ? "critical-reminder text-red-600" : "text-gray-700"} leading-tight`}>
                          {rem.text}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-[10px] md:text-[11px] list-none">No reminders.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lookup Table Modal */}
        {showLookup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 md:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 border-bottom flex flex-col gap-3 bg-[#f8fafc]">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#1e293b]">Lab Test Lookup Table</h3>
                  <button 
                    onClick={() => setShowLookup(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2"
                  >
                    &times;
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search test name, specimen, or alias..."
                    className="w-full p-3 md:p-2 pl-10 md:pl-8 border border-[#ced4da] rounded-lg text-base md:text-sm focus:ring-2 focus:ring-[#334155] focus:outline-none"
                    value={lookupSearch}
                    onChange={(e) => setLookupSearch(e.target.value)}
                  />
                  <svg className="absolute left-3 top-3.5 md:top-2.5 h-5 w-5 md:h-4 md:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="overflow-auto p-2 md:p-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr>
                      <th className="p-2 border-b-2 border-gray-200 font-bold text-[#334155]">Test Name</th>
                      <th className="p-2 border-b-2 border-gray-200 font-bold text-[#334155] hidden md:table-cell">Specimen</th>
                      <th className="p-2 border-b-2 border-gray-200 font-bold text-[#334155]">Container</th>
                      <th className="p-2 border-b-2 border-gray-200 font-bold text-[#334155]">Laboratory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getParsedLookup().filter(entry => {
                      const search = lookupSearch.toLowerCase().trim();
                      if (!search) return true;

                      const name = entry.testName.toLowerCase();
                      const spec = entry.specimen.toLowerCase();
                      const form = entry.formType.toLowerCase();
                      
                      const isMatch = (text: string, term: string) => {
                        if (term.length <= 2) {
                          const regex = new RegExp(`\\b${term}\\b`, 'i');
                          return regex.test(text);
                        }
                        return text.includes(term);
                      };

                      const aliases: Record<string, string[]> = {
                        'na': ['sodium'], 'k': ['potassium'], 'cl': ['chloride'], 'ca': ['calcium'],
                        'mg': ['magnesium'], 'phos': ['phosphorus', 'po4'], 'fbs': ['sugar', 'glucose'],
                        'bua': ['uric acid', 'blood uric acid', 'blooduricacid'], 'crea': ['creatinine'], 'urinalysis': ['ua'],
                        'fecalysis': ['stool exam', 'stool analysis'], 'cbc': ['complete blood count'],
                        'pt': ['prothrombin time', 'protime', 'inr'],
                        'ptt': ['partial thromboplastin time', 'aptt'],
                        'tpag': ['albumin globulin'], 'trop i': ['troponin'], 'hba1c': ['glycated hemoglobin', 'a1c'],
                        'tsh': ['thyroid stimulating hormone'], 'lipid profile': ['lipid panel', 'nonfasting lp'],
                        'ogtt': ['glucose tolerance'], 'blood cs': ['bcs', 'blood culture & sensitivity'],
                        'coombs test': ['direct coombs', 'indirect coombs', 'coombs'],
                        'tb': ['total bilirubin', 'totalbilirubin'], 'db': ['direct bilirubin', 'directbilirubin'], 'ib': ['indirect bilirubin', 'indirectbilirubin'],
                        'c3': ['complement 3'], 'dsdna': ['anti-dsdna', 'anti dsdna'],
                        '25-hydroxy vit d': ['vit d', 'vitd', 'vitamin d'],
                        'nh3': ['ammonia'],
                      };

                      const matchAlias = Object.entries(aliases).some(([key, vals]) => {
                        if (isMatch(name, key)) return vals.some(v => isMatch(v, search));
                        if (isMatch(key, search)) return vals.some(v => isMatch(name, v));
                        return false;
                      });

                      return isMatch(name, search) || isMatch(spec, search) || isMatch(form, search) || matchAlias;
                    }).map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="p-2 font-medium">{entry.testName}</td>
                        <td className="p-2 hidden md:table-cell">{entry.specimen}</td>
                        <td className="p-2">
                          {CUP_SPECIMENS.includes(entry.specimen.toLowerCase()) ? 'Cup' : (entry.top === 'N/A' ? 'N/A' : `${entry.top}`)}
                        </td>
                        <td className="p-2">{entry.formType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t bg-[#f8fafc] flex justify-end">
                <button 
                  onClick={() => setShowLookup(false)}
                  className="bg-[#334155] text-white px-6 py-3 md:py-2 rounded-lg font-bold w-full md:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'generator' && (
        <>
          <div className="form-header-container">
            <h2>Generated Form Previews</h2>
            <button 
              onClick={handlePrint}
              className="bg-[#334155] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#475569] transition-colors shadow-md"
            >
              🖨️ Print Forms (Final Step)
            </button>
          </div>

          <div id="preview-instructions" className="bg-white border border-[#ced4da] p-[15px] rounded-lg my-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)]">
            <p className="text-base mt-1.25 text-[#374151]">
              <strong>• Edit Text:</strong> Click any text box on the forms to make final adjustments.
            </p>
            <p className="text-base mt-1.25 text-[#374151]">
              <strong>• Change Font Size:</strong> Double-click any text box. A size input will pop out.
            </p>
            <p className="text-base mt-1.25 text-[#374151]">
              <strong>• Printing:</strong> Set scale to 88% and ensure paper size is A4.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <p className="text-xs text-gray-500 italic">Scale to 88% and ensure paper size is A4 for best results.</p>
            </div>
          </div>

          <div className="form-previews flex flex-wrap gap-[15px] p-0 justify-start print-content">
            {forms.map((form, idx) => (
              <LabForm key={idx} form={form} onUpdate={(updated) => updateForm(idx, updated)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TalongTab;
