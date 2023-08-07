import replyIcon from "../assets/icons/icon-reply.svg";
import { CommentType } from "../hooks/states";
import { formatDistance } from "date-fns";
import { useEffect, useRef, useState } from "react";
import AddComment from "./AddComment";
import { useAppSelector } from "../hooks/hooks";
import { CommentService } from "../services/comment.service";
import { FirebaseError } from "firebase/app";
import * as _ from "lodash";
import { useDispatch } from "react-redux";
import {
  openConfirmDialog,
  setCommentInfo,
  setInfoType,
} from "../hooks/commentSlice";
import { Toast } from "primereact/toast";

type commentProp = {
  comment: CommentType;
  replyIndex?: any;
};

const CommentCard = ({ comment, replyIndex }: commentProp) => {
  const [commentForm, setCommentForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editCommentField, setEditCommentField] = useState<string>("");
  const authUser = useAppSelector((state) => state.auth.authUser);
  const commentservice = new CommentService();
  const dispatch = useDispatch();
  const allComments = useAppSelector((state) => state.comments.comments);
  const toastRef = useRef<any>(null);

  const getUsernameFromEmail = (): string | null => {
    if (comment) {
      const userEmailArray = comment.user.email?.split("@")[0];
      return userEmailArray ? userEmailArray : null;
    } else {
      return null;
    }
  };

  const formatCommentDate = () => {
    if (comment && comment.createdAt) {
      // Convert the 'createdAt' property to a Date object
      const createdAtDate = new Date(comment.createdAt);

      // Check if the 'createdAtDate' is a valid date
      if (!isNaN(createdAtDate.getTime())) {
        return formatDistance(createdAtDate, new Date(), {
          addSuffix: true,
        });
      } else {
        // Handle invalid date
        return "Invalid Date";
      }
    } else {
      return "Invalid Date";
    }
  };

  const displayReplyButton = () => {
    if (authUser && comment && authUser.email === comment.user.email) {
      if (!comment.hasOwnProperty("replyingTo")) {
        return (
          <div className="replyButton flex items-center justify-end mt-3 sm:mt-3 md:mt-0 lg:mt-0">
            <button
              onClick={() => setCommentForm((current) => !current)}
              type="button"
              className="text-moderateBlue font-bold flex items-center hover:text-blue-400 active:text-blue-400"
            >
              <img src={replyIcon} className="mr-2" alt="reply" />
              Reply
            </button>

            <button
              type="button"
              className="text-red-600 font-bold ml-4 hover:text-red-400 active:text-red-400"
              onClick={deleteComment}
            >
              <i className="pi pi-trash mr-1 text-xs"></i>
              <span className="hidden sm:hidden md:inline lg:inline">
                Delete
              </span>
            </button>

            <button
              type="button"
              className="text-moderateBlue font-bold ml-2 hover:text-blue-400 active:text-blue-400"
              onClick={() => setEditMode((current) => !current)}
            >
              <i className="pi pi-pencil mr-1 text-xs"></i>
              <span className="hidden sm:hidden md:inline lg:inline">Edit</span>
            </button>
          </div>
        );
      } else {
        return (
          <div className="replyButton flex items-center justify-end mt-3 sm:mt-3 md:mt-0 lg:mt-0">
            <button
              type="button"
              className="text-red-600 font-bold ml-4 hover:text-red-400 active:text-red-400"
              onClick={deleteComment}
            >
              <i className="pi pi-trash mr-1 text-xs"></i>
              <span className="hidden sm:hidden md:inline lg:inline">
                Delete
              </span>
            </button>

            <button
              type="button"
              className="text-moderateBlue font-bold ml-2 hover:text-blue-400 active:text-blue-400"
              onClick={() => setEditMode((current) => !current)}
            >
              <i className="pi pi-pencil mr-1 text-xs"></i>
              <span className="hidden sm:hidden md:inline lg:inline">Edit</span>
            </button>
          </div>
        );
      }
    } else {
      if (comment && !comment.hasOwnProperty("replyingTo")) {
        return (
          <div className="replyButton flex items-center justify-end mt-3 sm:mt-3 md:mt-0 lg:mt-0">
            <button
              onClick={() => setCommentForm((current) => !current)}
              type="button"
              className="text-moderateBlue font-bold flex items-center hover:text-blue-400 active:text-blue-400"
            >
              <img src={replyIcon} className="mr-2" alt="reply" />
              Reply
            </button>
          </div>
        );
      }
    }
  };
    // DELETE COMMENT
    const deleteComment = () => {
      if (comment.hasOwnProperty("replyingTo")) {
        // DELTE REPLY
        dispatch(setInfoType("reply"));
        dispatch(openConfirmDialog());
        dispatch(setCommentInfo(comment));
      } else {
        // DELETE COMMENT
        dispatch(setInfoType("comment"));
        dispatch(openConfirmDialog());
        dispatch(setCommentInfo(comment));
      }
    };



  

  const toggleEditComment = () => {
    return editMode ? (
      <>
        <div className="comment-text text-sm text-gray-500 font-medium mt-3">
          <textarea
            name="editCommentField"
            id="editCommentField"
            rows={2}
            className="form-control"
            value={editCommentField}
            onChange={(e) => setEditCommentField(e.target.value)}
          ></textarea>
          <div className="text-right">
            <button
              type="button"
              className="bg-moderateBlue px-5 py-3 text-white rounded-md text-sm"
              onClick={updateCommentContent}
            >
              UPDATE
            </button>
          </div>
        </div>
      </>
    ) : (
      <div className="comment-text text-sm text-gray-500 font-medium mt-3">
        {comment.content}
      </div>
    );
  };

  useEffect(() => {
    editMode ? setEditCommentField(comment.content) : setEditCommentField("");
  }, [comment.content, editMode]);

  const updateCommentContent = () => {
    if (editCommentField) {
      if (comment.hasOwnProperty("replyingTo")) {
        const parentComment = allComments.find(
          (parComment) => parComment.id === comment.replyingTo
        );

        const updatedContent = {
          ...comment,
          content: editCommentField,
        };

        if (parentComment) {
          const allReplies = _.cloneDeep(parentComment.replies);
          // const replyIndex = allReplies!.indexOf(comment);

          allReplies?.splice(replyIndex, 1, updatedContent);

          const updatedParentContent = {
            ...parentComment,
            replies: allReplies,
          };

          commentservice
            .updateCommentReplies(updatedParentContent.id, updatedParentContent)
            .then((response) => {
              setEditMode(false);
              setEditCommentField("");
            })
            .catch((error: FirebaseError) => {
              toastRef.current?.show({
                severity: "error",
                summary: error.name,
                detail: error.code,
                life: 3000,
              });
            });
        }
      } else {
        const updatedContent = {
          ...comment,
          content: editCommentField,
        };

        commentservice
          .updateCommentContent(comment.id, updatedContent)
          .then((response) => {
            setEditMode(false);
            setEditCommentField("");
          })
          .catch((error: FirebaseError) => {
            toastRef.current?.show({
              severity: "error",
              summary: error.name,
              detail: error.code,
              life: 3000,
            });
          });
      }
    }
  };

  
  return (
    <>
      {comment && (
        <div className="card comment-card">
          <div className="card-body">
            <div className="user-info flex items-center">
              <div className="mr-2">
                <img
                  src={
                    comment.user.image
                      ? require(`../assets/avatars/${comment.user.image}`)
                      : require("../assets/avatars/default.jpg")
                  }
                  className="w-10 h-10 rounded-full"
                  alt=""
                />
              </div>
              <span className="block mr-3 text-darkBlue font-extrabold">
                {getUsernameFromEmail()}
              </span>
              <span className="block text-xs text-gray-500 font-medium">
                {formatCommentDate()}
              </span>
            </div>

            {displayReplyButton()}

            {toggleEditComment()}
          </div>
        </div>
      )}

      {commentForm && (
        <AddComment comment={comment} setCommentForm={setCommentForm} />
      )}
      <Toast ref={toastRef} />
    </>
  );
};

export default CommentCard;
