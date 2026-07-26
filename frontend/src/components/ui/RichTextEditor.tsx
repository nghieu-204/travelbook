'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Dynamically load react-quill-new to avoid SSR errors with document/window
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list',
    'link'
  ]

  return (
    <div className={`rich-text-editor-wrapper bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden ${className}`}>
      <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #334155;
          background-color: #1e293b;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .ql-editor {
          min-height: 150px;
          color: white;
          font-size: 0.875rem;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: #cbd5e1;
        }
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
          fill: #cbd5e1;
        }
        .ql-snow .ql-picker {
          color: #cbd5e1;
        }
        .ql-snow .ql-picker-options {
          background-color: #1e293b;
          border-color: #334155;
        }
      `}</style>
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}
