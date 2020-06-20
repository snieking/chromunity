import React from 'react';
import MetaTags from 'react-meta-tags';

interface Props {
  description: string;
  title: string;
}

const PageMeta: React.FunctionComponent<Props> = (props) => {
  function getDescription() {
    return props.description.slice(0, 160);
  }

  return (
    <div>
      <MetaTags>
        {props.description && <meta name="description" content={getDescription()} />}
        {props.title && <meta property="og:title" content={props.title} />}
        <meta property="og:image" content="/ms-icon-144x144.png" />
      </MetaTags>
    </div>
  );
};

export default PageMeta;
