import React from 'react';
import { Editor, type EditorConfig } from '@satek-vn/react-editor';

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichText: React.FC<RichTextProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả...',
}) => {
  const config: EditorConfig = {
    placeholder,
    menubar: [
      'bold',
      'italic',
      'underline',
      'strike',
      '',
      'bullet-list',
      'ordered-list',
      '',
      'text-align',
      '',
      'image',
      'link',
      '',
      'h1',
      'h2',
      'h3',
      '',
      'mention',
    ],
    uploadImage: async (files) => {
      // Example: Upload files and return URLs
      return Array.from(files).map((file) => URL.createObjectURL(file));
    },
    popupLink: (previousUrl, submit) => {
      // Example: Open popup and submit url
      const url = window.prompt('URL', previousUrl);
      if (url === null) {
        return;
      }

      submit(url);
    },
    getSuggestion: (query) => {
      // Example: Return mention suggestions
      const list = [
        { id: 1, label: 'Lea Thompson' },
        { id: 2, label: 'Cyndi Lauper' },
        { id: 3, label: 'Tom Cruise' },
        { id: 4, label: 'Madonna' },
        { id: 5, label: 'Jerry Hall' },
        { id: 6, label: 'Joan Collins' },
        { id: 7, label: 'Winona Ryder' },
        { id: 8, label: 'Christina Applegate' },
        { id: 9, label: 'Alyssa Milano' },
        { id: 10, label: 'Molly Ringwald' },
        { id: 11, label: 'Ally Sheedy' },
        { id: 12, label: 'Debbie Harry' },
        { id: 13, label: 'Olivia Newton-John' },
        { id: 14, label: 'Elton John' },
        { id: 15, label: 'Michael J. Fox' },
        { id: 16, label: 'Axl Rose' },
        { id: 17, label: 'Emilio Estevez' },
        { id: 18, label: 'Ralph Macchio' },
        { id: 19, label: 'Rob Lowe' },
        { id: 20, label: 'Jennifer Grey' },
        { id: 21, label: 'Mickey Rourke' },
        { id: 22, label: 'John Cusack' },
        { id: 23, label: 'Matthew Broderick' },
        { id: 24, label: 'Justine Bateman' },
        { id: 25, label: 'Lisa Bonet' },
      ];

      return list
        .filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase()),
        )
        .slice(0, 5);
    },
  };

  return (
    <div className="rich-text-editor">
      <Editor config={config} value={value} onChange={onChange} />
    </div>
  );
};

export default RichText;
