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
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | code codesample | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          resize: true,
          branding: false,
          promotion: false,
          // Completely disable content filtering
          verify_html: false,
          cleanup: false,
          convert_urls: false,
          remove_script_host: false,
          relative_urls: false,
          // Allow everything
          valid_elements: '*[*]',
          valid_children: '+body[style],+div[*],+span[*],+p[*],+h1[*],+h2[*],+h3[*],+h4[*],+h5[*],+h6[*]',
          extended_valid_elements: '*[*]',
          custom_elements: '*[*]',
          // Raw content handling
          entity_encoding: 'raw',
          entities: '160,nbsp,38,amp,60,lt,62,gt',
          // Preserve everything
          preserve_cdata: true,
          keep_styles: true,
          fix_list_elements: false,
          fix_table_elements: false,
          element_format: 'html',
          indent: false,
          // Source code dialog settings
          code_dialog_height: 500,
          code_dialog_width: 1200,
          // Disable all automatic processing
          invalid_elements: '',
          invalid_styles: {},
          // Force raw content preservation
          setup: function(editor) {
            let originalContent = '';
            
            // Store original content when code dialog opens
            editor.on('ExecCommand', function(e) {
              if (e.command === 'mceCodeEditor') {
                originalContent = editor.getContent({format: 'raw'});
              }
            });
            
            // Prevent content modification on mode switches
            editor.on('BeforeSetContent', function(e) {
              // Don't process content if it's being set programmatically
              if (e.content && typeof e.content === 'string') {
                e.content = e.content; // Keep as-is
              }
            });
            
            // Preserve content exactly as entered in source mode
            editor.on('SaveContent', function(e) {
              // Don't modify content on save
              return;
            });
          },
          // Disable all content processors
          preprocess: function() { return; },
          postprocess: function() { return; },
        }}
      />
    </Box>
  );
}
