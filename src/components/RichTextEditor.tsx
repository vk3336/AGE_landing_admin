"use client";
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Typography } from '@mui/material';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  height?: number;
  placeholder?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  label, 
  height = 400,
  placeholder = 'Start typing...'
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | code | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          resize: true,
          branding: false,
          promotion: false,
        }}
      />
    </Box>
  );
}
