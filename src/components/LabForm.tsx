import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { LabRequest } from '../types';
import { RENDER_FIELDS } from '../constants';

interface LabFormProps {
  form: LabRequest;
  onUpdate: (updatedForm: LabRequest) => void;
}

interface AutoFitFieldProps {
  element?: 'input' | 'textarea';
  className: string;
  baseFontSize: number;
  value: string;
  onChange: (value: string) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  title?: string;
}

const AutoFitField: React.FC<AutoFitFieldProps> = ({
  element = 'input',
  className,
  baseFontSize,
  value,
  onChange,
  onDoubleClick,
  title
}) => {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [scale, setScale] = useState<number>(1.0);

  const baseCqw = (baseFontSize / 415) * 100;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const calculateScale = () => {
      const minScale = 0.2; // Allow scaling down to 20% for very long text
      const maxScale = 1.0;

      const containerWidth = el.parentElement ? el.parentElement.clientWidth : 415;
      if (!containerWidth || !el.clientHeight) return 1.0;

      const basePx = (baseFontSize / 415) * containerWidth;

      const checkFits = (testPx: number) => {
        el.style.fontSize = `${testPx}px`;
        if (element === 'textarea') {
          // Check vertical overflow for textareas
          return el.scrollHeight <= el.clientHeight + 1;
        }
        // Single line inputs: check both horizontal and vertical overflow
        return el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 1;
      };

      // Check if full scale fits directly
      if (checkFits(basePx * maxScale)) {
        el.style.fontSize = '';
        return maxScale;
      }

      let low = minScale;
      let high = maxScale;
      let best = minScale;

      for (let i = 0; i < 12; i++) {
        const mid = (low + high) / 2;
        if (checkFits(basePx * mid)) {
          best = mid;
          low = mid; // Try larger font
        } else {
          high = mid; // Need smaller font
        }
      }

      el.style.fontSize = '';
      return best;
    };

    const bestScale = calculateScale();
    setScale(bestScale);

    const observer = new ResizeObserver(() => {
      if (ref.current) {
        const newScale = calculateScale();
        setScale(newScale);
      }
    });

    if (el.parentElement) {
      observer.observe(el.parentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, baseFontSize, element]);

  const finalStyle: React.CSSProperties = {
    fontSize: `${baseCqw * scale}cqw`
  };

  if (element === 'textarea') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        className={className}
        style={finalStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDoubleClick={onDoubleClick}
        title={title}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      className={className}
      style={finalStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onDoubleClick={onDoubleClick}
      title={title}
    />
  );
};

const LabForm: React.FC<LabFormProps> = ({ form, onUpdate }) => {
  const [fontSizes, setFontSizes] = useState<Record<string, number>>({});
  const [setter, setSetter] = useState<{ visible: boolean; x: number; y: number; field: string; baseSize: number } | null>(null);

  // Clear any temporary editor positions saved in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('lrf_field_positions');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const cleanAgeSex = (ageSexString: string) => {
    if (!ageSexString) return { age: '', sex: '' };
    let cleaned = ageSexString.toLowerCase().replace(/years old|yo|y\/o|yrs|yr/g, '').trim();

    let age = '';
    let sex = '';

    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      age = parts[0].trim();
      sex = parts[1].trim().toUpperCase();
    } else {
      const lastChar = cleaned.slice(-1).toUpperCase();
      if (lastChar === 'M' || lastChar === 'F') {
        sex = lastChar;
        age = cleaned.slice(0, -1).trim();
      } else {
        let parts = cleaned.split(' ');
        sex = parts.pop()?.toUpperCase() || '';
        age = parts.join(' ').trim();
      }
    }

    if (sex.includes('MALE')) sex = 'M';
    if (sex.includes('FEMALE')) sex = 'F';
    if (sex.length > 1 && (sex.startsWith('M') || sex.startsWith('F'))) {
      sex = sex.charAt(0);
    }

    return { age, sex };
  };

  const ageSexData = cleanAgeSex(form.age_sex);

  const handleDoubleClick = (e: React.MouseEvent, fieldClass: string, defaultSize: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setSetter({
      visible: true,
      x: rect.left,
      y: rect.bottom + 5,
      field: fieldClass,
      baseSize: fontSizes[fieldClass] || defaultSize
    });
  };

  const handleFontSizeChange = (size: number) => {
    if (setter) {
      setFontSizes(prev => ({ ...prev, [setter.field]: size }));
      setSetter(null);
    }
  };

  return (
    <div className="form-container">
      <div 
        className="form-preview lrf-coords"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}single_lrf.jpg)` }}
      >
        {RENDER_FIELDS.map((field, idx) => {
          if (!field.key) return null;
          
          const value = field.key === 'name' ? (form.name || '').toUpperCase() : (form as any)[field.key] || '';
          const baseSize = fontSizes[field.class] || field.defaultFontSize || 16;
          
          return (
            <AutoFitField
              key={idx}
              element={field.element === 'textarea' ? 'textarea' : 'input'}
              className={`overlay-field ${field.class}`}
              baseFontSize={baseSize}
              value={value}
              onChange={(val) => onUpdate({ ...form, [field.key!]: val })}
              onDoubleClick={(e) => handleDoubleClick(e, field.class, field.defaultFontSize || 16)}
              title={field.title}
            />
          );
        })}

        {/* Special Fields */}
        <AutoFitField
          element="input"
          className="overlay-field age-sex-age"
          baseFontSize={fontSizes['age-sex-age'] || 20}
          value={ageSexData.age}
          onChange={(val) => onUpdate({ ...form, age_sex: `${val}/${ageSexData.sex}` })}
          onDoubleClick={(e) => handleDoubleClick(e, 'age-sex-age', 20)}
          title="AGE"
        />

        <AutoFitField
          element="input"
          className="overlay-field age-sex-sex"
          baseFontSize={fontSizes['age-sex-sex'] || 20}
          value={ageSexData.sex}
          onChange={(val) => onUpdate({ ...form, age_sex: `${ageSexData.age}/${val}` })}
          onDoubleClick={(e) => handleDoubleClick(e, 'age-sex-sex', 20)}
          title="SEX"
        />

        <AutoFitField
          element="textarea"
          className="overlay-field requests-field"
          baseFontSize={fontSizes['requests-field'] || 22}
          value={form.requests_list || ''}
          onChange={(val) => onUpdate({ ...form, requests_list: val })}
          onDoubleClick={(e) => handleDoubleClick(e, 'requests-field', 22)}
          title="LAB EXAM"
        />
      </div>

      {setter && setter.visible && (
        <div 
          className="font-setter-container"
          style={{ left: `${setter.x}px`, top: `${setter.y}px` }}
        >
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Font Size (px): </label>
          <input 
            type="number" 
            className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            defaultValue={setter.baseSize} 
            onBlur={(e) => handleFontSizeChange(parseFloat(e.target.value) || setter.baseSize)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFontSizeChange(parseFloat((e.target as HTMLInputElement).value) || setter.baseSize);
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default LabForm;
