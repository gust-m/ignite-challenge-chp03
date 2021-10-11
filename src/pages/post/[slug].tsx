import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // console.log(post.data.content);
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <Link href="/">
        <img
          src="/images/logo.svg"
          alt="spacetravelling"
          className={styles.logo}
        />
      </Link>

      <main className={`${styles.container}`}>
        <img src={post.data.banner.url} alt="logo" />
        <div className={styles.content}>
          <span className={styles.postInfo}>
            <h1>{post.data.title}</h1>
            <time>
              <FiCalendar />
              {post.first_publication_date}
            </time>
            <p>
              <FiUser />
              {post.data.author}
            </p>
          </span>

          <div className={styles.post}>
            {post.data.content.map(content => (
              <article>
                <h1>{content.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    data: {
      title: response.data.title,
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
      banner: {
        url: response.data.main.url,
      },
    },
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd eeeeee uuuu',
      {
        locale: ptBR,
      }
    ),
  };

  return {
    props: {
      post,
    },
    revalidate: 30 * 60, // 30 minutes
  };
};
